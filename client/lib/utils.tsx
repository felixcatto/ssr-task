import { createStitches } from '@stitches/core';
import { AxiosError } from 'axios';
import cn from 'classnames';
import { useFormikContext } from 'formik';
import { omit } from 'lodash-es';
import React from 'react';
import stringMath from 'string-math';
import { preload } from 'swr';
import { useLocation } from 'wouter';
import { useStore as useStoreRaw } from 'zustand';
import { getApiUrl, getGenericRouteByHref, roles } from '../../server/lib/sharedUtils.js';
import { IApiErrors, IContext, IUseStore, IUseSubmit } from '../../server/lib/types.js';
import { Context, FormContext } from './context.js';

export const useContext = () => React.useContext<IContext>(Context);

export const { css, getCssText } = createStitches({
  utils: {
    w: value => ({ width: value }),
    h: value => ({ height: value }),

    bg: value => ({ background: value }),

    p: value => ({ padding: value }),
    pt: value => ({ paddingTop: value }),
    pr: value => ({ paddingRight: value }),
    pb: value => ({ paddingBottom: value }),
    pl: value => ({ paddingLeft: value }),
    px: value => ({ paddingLeft: value, paddingRight: value }),
    py: value => ({ paddingTop: value, paddingBottom: value }),

    m: value => ({ margin: value }),
    mt: value => ({ marginTop: value }),
    mr: value => ({ marginRight: value }),
    mb: value => ({ marginBottom: value }),
    ml: value => ({ marginLeft: value }),
    mx: value => ({ marginLeft: value, marginRight: value }),
    my: value => ({ marginTop: value, marginBottom: value }),
  },
});

export const userRolesToIcons = {
  [roles.admin]: 'fa fa-star',
  [roles.user]: 'fa fa-fire',
  [roles.guest]: 'fa fa-ghost',
};

export const WithApiErrors = (Component: React.ComponentType<IApiErrors>) => props => {
  const [apiErrors, setApiErrors] = React.useState({});
  return (
    <FormContext.Provider value={{ apiErrors, setApiErrors }}>
      <Component {...props} apiErrors={apiErrors} setApiErrors={setApiErrors} />
    </FormContext.Provider>
  );
};

const getAxiosErrorData = (axiosError: AxiosError): any => axiosError.response?.data || {};

export const useSubmit: IUseSubmit = onSubmit => {
  const { setApiErrors } = React.useContext(FormContext);

  const wrappedSubmit = async (values, actions) => {
    try {
      await onSubmit(values, actions);
    } catch (e: any) {
      const { errors } = getAxiosErrorData(e);
      if (errors) {
        setApiErrors(errors);
      } else {
        throw e;
      }
    }
  };

  return wrappedSubmit;
};

export const ErrorMessage = ({ name }) => {
  const { apiErrors } = React.useContext(FormContext);
  const error = apiErrors[name];
  return error ? <div className="error">{error}</div> : null;
};

export const Field = props => {
  const { apiErrors, setApiErrors } = React.useContext(FormContext);
  const { values, handleBlur: onBlur, handleChange }: any = useFormikContext();
  const value = values[props.name];
  const { as, children, ...restProps } = props;
  const asElement = as || 'input';
  const onChange = e => {
    setApiErrors(omit(apiErrors, e.target.name));
    handleChange(e);
  };

  return React.createElement(asElement, { ...restProps, onChange, onBlur, value }, children);
};

export const SubmitBtn = ({ children, ...props }) => {
  const { isSubmitting, submitForm } = useFormikContext();
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      {...props}
      onClick={e => {
        e.preventDefault();
        submitForm(); // needed because original Formik submit suppress Error's
      }}
    >
      {children}
    </button>
  );
};

export const getCssValue = (cssValue: string) =>
  stringMath(cssValue.trim().replaceAll('calc', '').replaceAll('s', ''));

export const useStore: IUseStore = selector => {
  const { globalStore } = useContext();
  return useStoreRaw(globalStore, selector);
};

export const useSetGlobalState = () => useStore(state => state.setGlobalState);

export const useNavigate = () => {
  const { axios } = useContext();
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

export const Link = ({ href, children, className = 'link', shouldOverrideClass = false }) => {
  const navigate = useNavigate();
  const linkClass = shouldOverrideClass ? className : cn('link', className);

  return (
    <div className={linkClass} onClick={() => navigate(href)}>
      {children}
    </div>
  );
};

export const NavLink = ({ href, children }) => {
  const [pathname] = useLocation();
  const className = cn('nav-link', {
    'nav-link_active':
      (href !== '/' && pathname.startsWith(href)) || (href === '/' && pathname === '/'),
  });

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

export const useLoaderUrl = () => {
  const [url] = useLocation();
  return getApiUrl('loaderData', {}, { url });
};
