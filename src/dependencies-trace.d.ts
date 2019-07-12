declare module DependenciesTrace{
	export const jsRegex:RegExp;
    export const tsRegex:RegExp;
    export const coffeRegex:RegExp;
    export function tsImports(str:string):string[];
    export function jsImports(str:string):string[];
    export function coffeImports(str:string):string[];
}
export = DependenciesTrace;