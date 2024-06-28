import { simpleComponent, simpleRegistry } from "@yupiik/react-ui-dynamic";
import { CustomForm } from "./Form";
import { JsonRpcDataLoader } from "./JsonRpcDataLoader";

export const customRegistry = simpleRegistry({
    Form: CustomForm,
    JsonRpcDataLoader: simpleComponent(JsonRpcDataLoader),
});
