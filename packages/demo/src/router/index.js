import { simpleComponent } from '@yupiik/react-ui-dynamic';
import { Link, redirect, BrowserRouter as Router } from 'react-router-dom';

// avoids page reloading
const NavLink = ({ href, children, ...rest }) => (
    <a href={href || ''} {...rest} onClick={e => {
        e.preventDefault();
        redirect(href || '');
    }}>
        {children || ''}
    </a>);

export const ReactRouterRegistry = {
    Router: simpleComponent(Router),
    Link: simpleComponent(Link),
    NavLink: simpleComponent(NavLink),
};
