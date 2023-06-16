import cn from 'classnames';
import { Form, Formik } from 'formik';
import React from 'react';
import useSWR from 'swr';
import { getApiUrl } from '../../../server/lib/sharedUtils.js';
import { ITodo } from '../../../server/lib/types.js';
import Layout from '../../common/Layout.jsx';
import { session } from '../../globalStore/store.js';
import {
  ErrorMessage,
  Field,
  SubmitBtn,
  WithApiErrors,
  css,
  useContext,
  useStore,
  useSubmit,
} from '../../lib/utils.js';
import { makeNotification } from '../../ui/Notifications.jsx';

const TodosRaw = () => {
  const { data: todos, mutate } = useSWR<ITodo[]>(getApiUrl('todos'));
  console.log(todos);
  const { axios } = useContext();
  const { isSignedIn } = useStore(session);
  const addNotification = useStore(state => state.addNotification);

  const [editingTodo, setEditingTodo] = React.useState<ITodo | null>(null);

  const initialValues = editingTodo
    ? {
        name: editingTodo.name,
        email: editingTodo.email,
        text: editingTodo.text,
      }
    : { name: '', email: '', text: '' };

  const onSubmit = useSubmit(async (values, fmActions) => {
    if (editingTodo) {
      await axios.put(getApiUrl('todo', { id: editingTodo.id }), { text: values.text });
      addNotification(makeNotification({ title: 'Todo', text: 'Edited successfully' }));
    } else {
      await axios.post(getApiUrl('todos'), values);
      addNotification(makeNotification({ title: 'Todo', text: 'Created successfully' }));
    }
    fmActions.resetForm();
    mutate();
    setEditingTodo(null);
  });

  const editTodo = todo => async () => {
    setEditingTodo(todo);
  };

  const changeTodoStatus = todo => async () => {
    await axios.put(getApiUrl('todo', { id: todo.id }), {
      ...todo,
      is_completed: !todo.is_completed,
    });
    mutate();
  };

  const cancelEdit = () => {
    setEditingTodo(null);
  };

  const deleteTodo = id => async () => {
    await axios.delete(getApiUrl('todo', { id }));
    mutate();
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-3">
          <Formik key={editingTodo?.id ?? '?'} initialValues={initialValues} onSubmit={onSubmit}>
            <Form>
              <div className="flex mb-4 items-center">
                {editingTodo ? (
                  <>
                    <h3 className="mb-0">Edit todo</h3>
                    <i className="fa fa-pen ml-4 text-xl text-secondary"></i>
                  </>
                ) : (
                  <h3 className="mb-0">Add new todo</h3>
                )}
              </div>
              {!isSignedIn && !editingTodo && (
                <>
                  <div className="mb-4">
                    <label className="text-sm">Name</label>
                    <Field className="input" name="name" />
                    <ErrorMessage name="name" />
                  </div>
                  <div className="mb-4">
                    <label className="text-sm">Email</label>
                    <Field className="input" name="email" />
                    <ErrorMessage name="email" />
                  </div>
                </>
              )}
              <div className="mb-6">
                <label className="text-sm">Text</label>
                <Field className="input" name="text" as="textarea" />
                <ErrorMessage name="text" />
              </div>
              {editingTodo && (
                <div className="link mr-3" onClick={cancelEdit}>
                  Cancel
                </div>
              )}
              <SubmitBtn className="btn btn_primary">{editingTodo ? 'Edit' : 'Add'}</SubmitBtn>
            </Form>
          </Formik>
        </div>

        <div className="col-9">
          <h3 className="mb-4">List of todos</h3>

          <table className="table table-fixed">
            <thead>
              <tr>
                <th className="w-32">
                  <div>Name</div>
                </th>
                <th className="w-44">
                  <div>Email</div>
                </th>
                <th>
                  <div>Text</div>
                </th>
                <th className="w-32">
                  <div>Status</div>
                </th>
                {isSignedIn && <th className="w-32"></th>}
              </tr>
            </thead>
            <tbody>
              {todos?.map(todo => (
                <tr key={todo.id} className={s.todoRow({ completed: todo.is_completed })}>
                  <td>{todo.name}</td>
                  <td className="truncate">{todo.email}</td>
                  <td className="text-justify">{todo.text}</td>
                  <td>
                    <i
                      className={s.todo(todo)}
                      title={todo.is_completed ? 'Completed' : 'Incomplete'}
                    ></i>
                  </td>
                  {isSignedIn && (
                    <td className="text-right">
                      <i
                        className={s.changeStatusIcon(todo)}
                        title={todo.is_completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                        onClick={changeTodoStatus(todo)}
                      ></i>
                      <i
                        className="fa fa-edit fa_big mr-3 clickable"
                        title="Edit"
                        onClick={editTodo(todo)}
                      ></i>
                      <i
                        className="far fa-trash-can fa_big clickable"
                        title="Delete"
                        onClick={deleteTodo(todo.id)}
                      ></i>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

const s = {
  todo: todo =>
    cn('fa', {
      'fa-check': todo.is_completed,
      'fa-dove': !todo.is_completed,
    }),

  changeStatusIcon: todo =>
    cn('fa fa_big mr-3 clickable', {
      'fa-check': !todo.is_completed,
      'fa-dove': todo.is_completed,
    }),

  todoRow: css({
    variants: {
      completed: {
        true: {
          background: 'var(--secondary-light)',
        },
      },
    },
  }),
};

export const Todos = WithApiErrors(TodosRaw);
