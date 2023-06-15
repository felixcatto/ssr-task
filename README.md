# Описание

Типичная SPA аппа, клиент на React, сервер - Fastify, бандлер - Vite.

### Требования

1. Реализовать `ServerSideRendering`. С сервера должен приходить готовый html странички, а не пустой ```<div id="root"></div>```. Допускается пустой список вместо тудушек при первом рендере. Т.е. достаточно отрисовать каркас, данные можно загрузить потом в useEffect / swr.

  * Для начала достаточно сделать SSR в prod режиме. Т.е. не надо заморачиваться с дев сервером. При изменении файлов ничего не будет происходить, ни ребандла, ни HMR, ни LiveReload'а странички.

2. Добавить рендер CSS in JS стилей на сервере

3. Добавить dev режим,  LiveReload / HMR при изменении клиентского кода

4. `currentUser` должен сразу, при первом рендере, попадать в стор. Т.е. нужно убрать `useEffect` и `localStorage` из `App.tsx`

### Дополнительные требования

5. Реализовать загрузку данных при первом рендере. Т.е. с сервера должен придти готовый список тудушек. Никаких пустых экранов и лоадеров. То же самое для страницы "/users" и "/users/:id".


6. Сделать то же самое, но для переходов по ссылкам, а не только на первый рендер приложения. Т.е. при клике на ```<Link href="/users" />``` не переходить на урл пока не загрузятся данные для этой страницы. 

### Команды

*Intall Prettier PreCommit Hook*
```
npm run prepare
```

*Development*
```
npm start
```

*Production*
```
npm run build
npm run start-prod-server
```

then go to `http://localhost:3000`

### SSR гайд

**Что нужно для реализации SSR?**

1. Отрендерить `App.tsx` на сервере.
2. Отправить `index.html` в котором заполнить ```<div id="root"></div>``` отрендеренной App, т.е. строкой с html разметкой.
3. На клиенте "оживить" строку с разметкой `App`, активировав `React`, т.е. навесив на нее `addEventListener's`
4. Настроить dev режим
5. Опционально. Если используется CSS in JS, отрендерить стили на сервере
6. Опционально. Прокинуть начальный стейт в `App` (currentUser, pageData...)
7. Опционально. SSR и стейт менеджеры
8. Опционально. Рендерить на сервере не только общую разметку `App`, но и данные необходимые конкретной странице.
9. Опционально. При кликах на ссылки не переходить на страницу пока не загрузятся данные, которые ей необходимы.

**Как выполнить шаг x?**

1. *Рендер `App.tsx` на сервере*

   прочитать про `renderToString` - https://react.dev/reference/react-dom/server/renderToString#rendering-a-react-tree-as-html-to-a-string

   прочитать про рендер вместе с роутером - https://github.com/molefrog/wouter#server-side-rendering-support-ssr

   создать `entry-server.tsx`. Файл экспортирующий функцию для рендера `App.tsx`. Забандлить этот файл по аналогии с тем, как мы бандлим наши приложения на клиенте. Т.е. собрать все зависимости `App.tsx` в один файл. Затранспайлить его заменив typescript и react jsx код, на код понятный для javascript.

   На сервере импортировать эту функцию, вызвать, получить html строку
   
   ```js
   // routes/ssr.ts
   const { render } = await import('entry-server.js');
   const appHtml = render();
   ```

2. *Отправка `index.html`*

   создать на сервере роут отправляющий `index.html` на любой входящий url от клиента. Заранее прочитать `index.html`. Отрендерить `App.tsx` и результат вставить в `index.html`.
  
   ```js
   // routes/ssr.ts
   const template = fs.readFileSync('index.html', 'utf-8');
   
   app.get('/*', async (req, reply) => {
     const { render } = await import('entry-server.js');
     const appHtml = render();
     const html = template.replace('<!-- content -->', appHtml)
     reply.type('html').send(html);
   })
   ```

3. *Гидрация  / "оживление" `App` на клиенте*

   прочитать про `hydrateRoot` - https://react.dev/reference/react-dom/client/hydrateRoot#hydrateroot

   в `entry-client` вызвать `hydrateRoot` вместо `createRoot`.


4. *Dev режим*

   тут два варианта
   - интегрировать `webpack` / `vite` `dev middleware` непосредственно в backendServer
   - запустить devServer на другом порту. Он будет раздавать html, css, js... , а при обращении к апи будет проксировать запрос на backendServer.

   Как по мне второй вариант проще, особенно если у вас сервер не на express и на него нет подробного гайда в webpack / vite.

   Итак, создаем кастомный devServer, копируя код отсюда - https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server

   Настраиваем прокси, чтобы в дев режиме все запросы на `/api/*` проксировать на backendServer.

   ```js
   // main/devServer.ts
   const nodeAppUrl = `http://localhost:${process.env.NODE_APP_PORT}`;
   app.use('/api', proxy(nodeAppUrl, { proxyReqPathResolver: req => `/api${req.url}` }));
   ```

5. *Рендер CSS in JS на сервере*
   
   Обычно все сводится к тому, чтобы вызвать функцию сбора css классов после того как вы отрендерили `App.tsx`
   ```jsx
   // entry-server.tsx
   import { getCssText } from '../lib/utils.jsx';

   export const render = url => {
     const appHtml = renderToString(<App />);

     const stitchesCss = getCssText(); // <- Получили строку с классами (.header {...})

     return { appHtml, stitchesCss };
   };
   ```

   И последующей ручной вставке стилей в `index.html`
   ```js
   // routes/ssr.ts
   const { appHtml, stitchesCss } = render(url);
   const cssInJsClasses = `<style id="stitches">${stitchesCss}</style></head>`;

   const html = template.replace('</head>', cssInJsClasses);
   reply.type('html').send(html);
   ```

6. *Прокидывание начального стейта в `App`*

   Чтобы прокинуть начальный стейт в `App.tsx`. Например
   * url - необходимый для рендера Router'а на сервере
   * текущего пользователя - чтобы не сохранять его в localStorage, а получать при старте приложения.
   * начальные данные для странице - например список тудушек, чтобы при старте не слать запрос на сервер в useEffect / swr, а сразу отрендерить список.
  
   Надо изменить `entry-server` так чтобы функция получала начальные параметры и прокинуть их в аппу

   ```jsx
   // entry-server.tsx
   export const render = (url, initialState) =>
     renderToString(
       <Router ssrPath={url}>
         <App {...initialState} />
       </Router>
     );
   ```

   На клиенте `entry-client` начальные параметры получим из window, чтобы при гидрации прочитать `initialState` и гидрировать `App` с тем же самым стейтом, с которым мы рендерили ее на сервере
   ```jsx
   // entry-client.tsx
   hydrateRoot(document.getElementById('root')!, <App {...window.INITIAL_STATE} />);
   ```

   Для этого подготовим плейсхолдер в `index.html`

   ```html
   <!-- index.html -->
   <div id="root"><!-- content --></div>
   <script>
     window.INITIAL_STATE = {{initialState}}  // <- плейсхолдер для замены через .replace на сервере
   </script>
   <script src="/myBundledApp.js"></script>
   ```

   Вызвовем `render` с параметрами и закинем эти параметры в window, чтобы клиент мог их прочитать
   ```js
   // routes/ssr.ts
   const initialState = { currentUser, ... };
   const { render } = await import('entry-server.js');
   const appHtml = render(url, initialState);

   const html = template
     .replace('<!-- content -->', appHtml)
     .replace('{{initialState}}', JSON.stringify(initialState));
   ```

7. *SSR и стейт менеджеры*

   Допустим мы сделали SSR, т.е. при инициализации `App.tsx` мы получили `initialState`
   ```js
   // App.tsx
   export const App = (initialState) => {
    const { currentUser } = initialState;
   }
   ```

   Как нам прокинуть этого юзера в глобалСтор (redux, mobx, zustand...)? Т.к. в мануалах обычно пишут "инициализируте стор в боковом файлике"

   ```js
   // app/store.ts
   import { configureStore } from '@reduxjs/toolkit'
   export const store = configureStore({
     reducer: {...},
   })
   ```

   А потом импортируйте его напрямую в ваши компоненты
   ```js
   // Todolist.tsx
   import { decrement, increment } from '~/store.ts'
   ```

   То у нас нет воможножности инициализации стора данными с сервера. Только useEffect, но это будет уже второй рендер. Решается это двумя способами.
   * Использовать SSR апи конкретного стейтменеджера
   * Использовать dependency injection

   Мне не нравится первый способ, т.к.
   * не факт что у вашего стейтменеджера будет реализовано такое апи
   * это выглядит как костыль

   Поэтому читаем "чем отличается Модуль от Скрипта" и "глобальное и локальное состояние в Модулях"

   https://ru.hexlet.io/blog/posts/skripty-moduli-i-biblioteki

   https://ru.hexlet.io/blog/posts/sovershennyy-kod-sostoyanie-v-modulyah

   Вкратце

   > Модули должны определять новые символы (классы, функции, константы) и экспортировать их для использования другими Модулями и Скриптами. Скрипты должны содержать исполняемый код.

   ```js
   // entry-client.tsx
   console.log()
   render(document.querySelector(...), <App /> )
   sayHi();
   ```

   > Но нельзя совмещать обе эти функции в одном файле.

   > Общий принцип работы с состоянием остается неизменным – все приложение заворачивается в функцию, которая определяет состояние глобальное для конкретного приложения, но локальное относительно среды запуска этого приложения.

   Далее оборачиваем создание стора в функцию (на примере zustand)

   ```js
   // globalStore.ts
   export const storeSlice = {
     currentUser: (initialState: IUser = guestUser) => initialState,
   };
   ```

   Создаем стор в App, а не в боком файлике и получаем возможность инициализировать `currentUser` при первом рендере
   ```js
   // App.tsx
   const { currentUser } = initialState;

   const globalStore = createStore((set, get) => ({
     ...initializedStoreSlice,
     currentUser: storeSlice.currentUser(currentUser),
   }));
   ```

   Сохраняем глобал стор в контексте
   ```jsx
   <Context.Provider value={{ globalStore }}>
   ```

   В компонентах импорируем стор не из файла, а из контекста
   ```jsx
   // Layout.tsx
   import { useStore } from 'zustand';

   const Layout = () => {
     const { globalStore } = useContext();
     const currentUser = useStore(globalStore, state => state.currentUser);
   ```

   Для удобства можно написать хук
   ```ts
   // client/utils.tsx
   import { useStore as useStoreRaw } from 'zustand';

   export const useStore: IUseStore = selector => {
     const { globalStore } = useContext();
     return useStoreRaw(globalStore, selector);
   };
   ```

   И писать меньше кода в компонентах
   ```jsx
   // Layout.tsx
   import { useStore } from './utils';

   const Layout = () => {
     const currentUser = useStore(state => state.currentUser);
   ```

8. *SSR рендер данных для страницы*

   Тут можно было бы сделать проще, но мы ~~не ищем легких путей~~ сделаем универсальное решение, чтобы было проще добавлять такие страницы в будующем и для того чтобы упростить реализацию 9.-ого шага. Поэтому кода будет довольно много.

   Итак нужно чтобы начальные данные для страницы рендерились на сервере. Т.е. при рендере `Users` в компонент сразу пришли данные `{ data: users }`, а не пустой массив и пустой экран
   ```js
   // pages/users/Index.tsx
   export const Users = () => {
     const { data: users } = useSWR<IUser[]>(getApiUrl('users'));
   ```
   Для этого можно использовать опцию `fallback` в `swr`. Если при рендере компонента у свр не окажется данных, он возьмет их из `fallback`. Осталось только найти способ как прокинуть эти данные `IUser[]` в `fallback`
   ```js
   // App.tsx
   export const App = () => {
     const swrConfig = {
       fallback: '???', // <-
     };
   ```

   Для этого создадим файл `routesLoaders.ts`, в котором будем описывать лоадеры, функции возвращающие начальные данные для конкретного роута. По сути это аналог getServerSideProps в NextJS и loader в Remix, только у нас пока нет возможности разместить их рядом с компонентами.

   ```ts
   // routesLoaders.ts
   const routeLoaders: IRouteLoaders = {
     [routes.users]: async opts => {
       return { users: opts.db.users };
     },

     [routes.user]: async opts => {
       const id = Number(opts.params.id);
       const user = opts.db.users.find(user => user.id === id);
       return { user };
     },
   };
   ```

   При рендере на сервере загрузим данные для страницы `loaderData` и прокинем их в `initialState` чтобы они были доступны.
   ```js
   // routes/ssr.ts
   app.get('/*', async (req, reply) => {
     const { url, currentUser } = req;

     const loaderData = await getLoaderData({ db: app.db, pathname: url });
     const initialState = { currentUser, loaderData };
   ```

   Теперь начальные данные (например `IUser[]`) доступны в `App` и можно кинуть их в fallback. Но мы пойдем немного дальше. По хорошему теперь в `pages/users/Index` получать начальные данные не из API `getApiUrl('users')`
   ```js
   // pages/users/Index.tsx
   export const Users = () => {
     const { data: users } = useSWR<IUser[]>(getApiUrl('users'));
   ```

   а из того же самого источника, из которого мы получили их при первом рендере. Т.е. из лоадера для страницы. Потому меняем на
   ```js
   // pages/users/Index.tsx
   export const Users = () => {
     const loaderUrl = useLoaderUrl();
     const { data } = useSWR<ILoaderData>(loaderUrl);
     const users = data?.users || [];
   ```
   Где `useLoaderUrl` просто возвращает урл вида `/loader-data?url=window.location.pathname`.

   Теперь надо создать на сервере хендлер `/loader-data`, который будет возвращать начальные данные для странцы, переданной через queryString
   ```js
   // routes/ssr.ts
   app.get('/loader-data', async (req, reply) => {
     const { url } = req.query;
     const loaderData = await getLoaderData({ db: app.db, pathname: url });
     reply.send(loaderData);
   });
   ```

   Осталось только по тому же ключу `loaderUrl` положить данные в `fallback` и при первом ренедере мы сразу получим компонент с данными, без пустых экранов и лоадеров :innocent:
   ```js
   // App.tsx
   export const App = (props: IInitialState) => {
     const { loaderData, pathname } = props;
     const loaderUrl = getApiUrl('loaderData', {}, { url: pathname });

     const swrConfig = {
       fallback: { [loaderUrl]: loaderData },
     };
   ```

9. *Предзагрузка данных для страницы при клиентском переходе / клике на Link*

   Т.к. на прошлом шаге мы сделали универсальное решение, тут будет все довольно просто. Создаем хелпер `navigate` который будет предзагружать данные в `swr` и переходить на нужную страницу по окончании загрузки.
   ```js
   // client/utils.tsx
   import { preload } from 'swr';

   export const useNavigate = () => {
     const [_, setLocation] = useLocation();

     const navigate = async href => {
       const isRouteWithLoader = getGenericRouteByHref(href);
       if (isRouteWithLoader) {
         await preload(getApiUrl('loaderData', {}, { url: href }), axios.get);
       }
       setLocation(href);
     };

     return navigate;
   };
   ```

   И используем его при кликах на ссылки Link и при програмных переходах между страницами
   ```jsx
   // client/utils.tsx
   export const Link = ({ href, children }) => {
     const navigate = useNavigate();

     return (
       <div onClick={() => navigate(href)}>
         {children}
       </div>
     );
   };
   ```
   ```jsx
   // pages/session/New.tsx
   const NewSessionRaw = () => {
     const navigate = useNavigate();

     const onSignIn = async userCreds => {
       const user = await axios.post(getApiUrl('session'), userCreds);
       navigate(getUrl('home')); // <-
     };
   ```

   Отлично, пустые экраны и лоадеры окончательно побеждены :innocent:
