import IntrospectionQuery from "./introspection-query.ts";
import { addScalar, TypesBuilder } from "./ts-builder.ts";

/** GraphQL to Typescript conversion class */
export class GQLTS {
    constructor() {
        this.Class = false;
        this.Endpoint = "";
        this.Interface = true;
        this.Nullable = false;
        this.OutFile = "./schema.ts";
        this.SchemaFile = "";
        this.Namespace = "";
    }
    public OutFile: string;
    public Endpoint: string;
    public SchemaFile: string;
    public Interface: boolean;
    public Class: boolean;
    public Nullable: boolean;
    public Namespace: string;

    public AddScalar(name: any, value: any): void {
        addScalar(name, value);
    }
    public Execute(): void {
        addScalar("ID", "string | number");
        addScalar("String", "string");
        addScalar("DateTime", "string | Date");
        addScalar("Boolean", "boolean");
        addScalar("Int", "number");

        if (this.SchemaFile === null) this.SchemaFile = "";
        if (this.OutFile === null) this.OutFile = "";
        if (this.Endpoint === null) this.Endpoint = "";

        if (this.SchemaFile.trim() !== "" && this.OutFile.trim() !== "") {
            Deno.readTextFile(this.SchemaFile)
                .then((res: string) => {
                    let opt = {
                        namespace: this.Namespace,
                        buildClasses: this.Class,
                        addIPrefix: this.Interface,
                        addNull: this.Nullable
                    };
                    let obj = JSON.parse(res);
                    let str = TypesBuilder(obj, opt);
                    Deno.writeTextFile(this.OutFile, str);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
        else if (this.Endpoint.trim() !== "" && this.OutFile.trim() !== "") {
            let qry = IntrospectionQuery();

            fetch(this.Endpoint, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(qry)
            }).then( async (resp) => { 
                let txt = await resp.text();
                try {
                    let opt = {
                        namespace: this.Namespace,
                        buildClasses: this.Class,
                        addIPrefix: this.Interface,
                        addNull: this.Nullable
                    };
                    let obj = JSON.parse(txt);
                    let str = TypesBuilder(obj, opt);
                    if (this.OutFile.trim() !== "") {
                        Deno.writeTextFile(this.OutFile, str);
                    }
                } catch (err) {
                    console.error(err);
                    console.log(txt);
                }
            }).catch(err => {
                console.error(err);
            });
        }
    };
}

export default GQLTS;
