import { useJsonRpc } from '@yupiik/react-ui-use-json-rpc';
import { JsonForms } from '@jsonforms/react';
// import { vanillaCells, vanillaRenderers } from '@jsonforms/vanilla-renderers'; // todo: bootstrap renderer
import { useMemo, useState } from 'react';
import { Alert, Button, Form, Placeholder } from 'react-bootstrap';
import { FromConfiguratonHoc } from '@yupiik/react-ui-dynamic';
import { bootstrapCells, bootstrapRenderers } from '../forms/bootstrap.form.renderers';

// todo: handle submit action using json-logic
export const CustomForm = ({
    initialData,
    submitButtonLabel,
    successMessage,
    jsonRpcMethod,
    needsSecurity,
    ...opts
}) => {
    const [formData, setFormData] = useState({ data: initialData || {} });
    const [submit, setSubmit] = useState(false);
    const jsonRpcConf = useMemo(() => ({
        payload: {
            jsonrpc: '2.0',
            method: jsonRpcMethod,
            params: formData.data,
        },
        needsSecurity,
        providedData: submit ? undefined : 'skip', // not falsy will skip the JSON-RPC call
        dependencies: [jsonRpcMethod, formData, submit, needsSecurity],
    }), [jsonRpcMethod, formData, submit, needsSecurity]);
    const [loading, error, data] = useJsonRpc(jsonRpcConf);

    return (
        <div>
            {submit && loading && <>
                <Placeholder xs={6} />
                <Placeholder xs={6} />
                <Placeholder xs={6} />
            </>}
            {submit && !loading && error && <>
                <Alert variant="danger">
                    <Alert.Heading>An error occurred</Alert.Heading>
                    <p>{error.message || error || 'unknown error'}</p>
                </Alert>
            </>}
            {submit && !loading && data && successMessage && <>
                <Alert variant="primary">
                    {typeof successMessage === 'string' ? successMessage : <FromConfiguratonHoc {...successMessage} />}
                </Alert>
            </>}
            {submit && !loading && data && !successMessage && <>
                <Alert variant="primary">
                    Submit was successful: {data}.
                </Alert>
            </>}
            <Form noValidate onSubmit={event => {
                event.preventDefault();
                event.stopPropagation();
                setSubmit(true);
            }}>
                <JsonForms
                    {...opts}
                    data={formData.data}
                    renderers={bootstrapRenderers}
                    cells={bootstrapCells}
                    onChange={data => {
                        setFormData(data);
                        setSubmit(false);
                    }}
                />
                <Button variant="primary" type="submit">
                    {submitButtonLabel || 'Submit'}
                </Button>
            </Form>
        </div>
    );
};
