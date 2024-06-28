import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';
import * as reactBootstrap from "react-bootstrap";
import * as reactFeather from "react-feather";
import { FromConfiguratonHoc, simpleRegistry, nestedRegistry } from "@yupiik/react-ui-dynamic";
import { ReactRouterRegistry } from "./router";
import { customRegistry } from './registry';
import './app.css';

const registry = {
    ...simpleRegistry(reactFeather),
    ...nestedRegistry(reactBootstrap),
    ...ReactRouterRegistry,
    ...customRegistry,
};

function App() {
    // todo: useJsonRpc once the mock setup uses express?
    const [opts, setOpts] = useState();
    useEffect(() => {
        fetch('app.json')
            .then(res => res.json())
            .then(res => setOpts(res));
    }, []);

    if (!opts) {
        return (<div>Loading...</div>);
    }

    return (<FromConfiguratonHoc registry={registry} options={opts} />);
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);