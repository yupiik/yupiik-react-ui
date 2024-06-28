import React from 'react';
import { useEffect, useMemo, useReducer } from "react";
import { Dynamic } from "./Dynamic";
import jsonLogic from './json-logic.operators';

const rewriteProp = (source, args) => {
    if (Array.isArray(source)) {
        return source.map(it => typeof it === 'object' ? rewriteProp(it, args) : it);
    }
    if (source.jsonLogic) {
        return jsonLogic.apply(source.jsonLogic, args);
    }
    return source;
};

/**
 * A HoC wrapping {@link Dynamic} component with some more connection options.
 * Its primary intent is to provide a plain configuration (JSON friendly) to render support - whereas dynamic still requires javascript for callacks for example.
 * For callbacks, it uses JSON-Logic evaluation to solve the JSON -> js mapping.
 * 
 * @param {object} registry component registry (key matching the component name)
 * @param {string} name the component name in the registry
 * @param {array} useEffectCallback the {@link useEffect} callbacks properties definition in JSON-Logic format, it can be an array or an object (behaves as an array of 1 element). Each element is a JSON-Logic expression.
 * @param {array} useReducerCallback the {@link useReducer} callbacks. {@constant initialState} is the state initial value and {@constant reducerJsonLogic} the JSON-Logic implementation which takes the current state and action as parameters. JSONLogic take the state and dispatch functions as parameters.
 * @param {object} callbacks the callbacks properties definition in JSON-Logic format, key is the callback name and value its JSON-Logic chain. The JSON-Logic can use variables `state`, `dispatch` and `event` (the callback event).
 * @param {object} configuration properties to passthrough the underlying component.
 * @param {object} parentState if no {@constant initialState} is passed it will be used to overwrite it, enables to forward through children the state when children are compatible.
 * @param {object} parentDispatch parent dispatch callback (to be able to modify parent state).
 */
export const FromConfiguratonHoc = ({
    registry = undefined,
    parentState = undefined,
    parentDispatch = undefined,
    options: {
        name,
        keepExtendedProps = false, // if some wrapper injects properties, forward them to the wrappped components (routers often do that, conditional does too)
        options: {
            useReducerCallback: {
                initialState = undefined,
                reducerJsonLogic = false,
            } = {},
            useEffectCallback = [],
            callbacks = {},
            configuration = {},
        } = {},
    },
    ...rest
}) => {
    const [state, dispatch] = useReducer(
        (currentState, action) => {
            if (action.type === '$state') {
                return action.value;
            }
            if (reducerJsonLogic) {
                return jsonLogic.apply(reducerJsonLogic, { parentState, parentDispatch, state: currentState, action });
            }
            if (parentDispatch) { // bubble up if there is no own definition
                parentDispatch(action);
            }
            // here there is no reducerJsonLogic so we just back with parent state
            return parentState;
        },
        initialState,
        localState => localState === undefined ? parentState : localState);

    useEffect(() => {
        if (!reducerJsonLogic) {
            dispatch({ type: '$state', value: parentState });
        }

        if (!useEffectCallback) {
            return;
        }

        let result;
        if (Array.isArray(useEffectCallback)) {
            result = useEffectCallback
                .map(it => jsonLogic.apply(it, { parentState, parentDispatch, state, dispatch }))
                .filter(it => it)
                .reduce((a, i) => {
                    if (typeof i === 'function') {
                        return () => {
                            a();
                            i();
                        };
                    }
                }, () => { });
        } else {
            result = jsonLogic.apply(useEffectCallback, { parentState, parentDispatch, state, dispatch });
        }
        if (typeof result === 'function') {
            return result;
        }
    }, [useEffectCallback, initialState, parentState]);

    const computedOptions = useMemo(() => {
        const opts = Object
            .keys(configuration)
            .reduce(
                (aggregator, name) => {
                    const value = configuration[name];
                    aggregator[name] = typeof value === 'object' ?
                        rewriteProp(value, {
                            parentState,
                            parentDispatch,
                            state,
                            dispatch,
                            props: rest,
                        }) :
                        value;
                    return aggregator;
                },
                !keepExtendedProps ? {} : { ...(rest || {}) });

        const callbackOpts = Object
            .keys(callbacks)
            .reduce((aggregator, callback) => {
                const spec = callbacks[callback];
                aggregator[callback] = e => jsonLogic.apply(spec, {
                    parentState,
                    parentDispatch,
                    state,
                    dispatch,
                    event: e,
                    props: rest,
                });
                return aggregator;
            }, {});

        return { name, options: { ...opts, ...callbackOpts, state, dispatch } };
    }, [callbacks, configuration, state, parentState, rest]);

    return (
        <Dynamic
            registry={registry}
            options={computedOptions}
        />
    );
};
