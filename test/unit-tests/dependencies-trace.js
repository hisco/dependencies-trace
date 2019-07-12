
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-spies'));

const {
    jsRegex,  
    tsRegex,  
    coffeRegex,
    tsImports,
    jsImports,
    coffeImports
} = require('../../src/dependencies-trace');

describe('dependencies-regex', ()=> {
    describe('tsRegex' , ()=>{
        it('Should be RegExp' , ()=>{
            expect(tsRegex instanceof RegExp).to.eq(true)
        })
    })
    describe('coffeRegex' , ()=>{
        it('Should be RegExp' , ()=>{
            expect(coffeRegex instanceof RegExp).to.eq(true)
        })
    })
    describe('jsImports' , ()=>{
        it('Require side effect only',()=>{
            const result = jsImports(`
            require('./ZipCodeValidator');
            let myValidator = new ZipCodeValidator();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('Require single export',()=>{
            const result = jsImports(`
            const a = require('./ZipCodeValidator');
            let myValidator = new ZipCodeValidator();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('Require multiple export',()=>{
            const result = jsImports(`
            var {a,b} = require('./ZipCodeValidator');
            let myValidator = new ZipCodeValidator();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
    });
    describe('tsImports', ()=> {
        it('Import a single export from a module with single quotes' , ()=>{
            const result = tsImports(`
            import {ZipCodeValidator } from './ZipCodeValidator' ;
            let myValidator = new ZipCodeValidator();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('Import a single export from a module with tilda' , ()=>{
            const result = tsImports(`
            import {ZipCodeValidator } from \`./ZipCodeValidator\` ;
            let myValidator = new ZipCodeValidator();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('Import a single export from a module with double quotes' , ()=>{
            const result = tsImports(`
            import { ZipCodeValidator } from "./ZipCodeValidator" ;
            let myValidator = new ZipCodeValidator();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('imports can also be renamed' , ()=>{
            const result = tsImports(`
            import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
            let myValidator = new ZCV();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('Import the entire module into a single variable, and use it to access the module exports ' , ()=>{
            const result = tsImports(`
            import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
            let myValidator = new ZCV();
            `);
            expect(result[0]).to.eq('./ZipCodeValidator')
        })
        it('Import a module for side-effects only' , ()=>{
            const result = tsImports(`
            import "./my-module.js";
            `);
            expect(result[0]).to.eq('./my-module.js')
        })
        it('Import a single export without extraction' , ()=>{
            const result = tsImports(`
            import a from "jquery";
            `);
            expect(result[0]).to.eq('jquery')
        })
    });
    describe('coffeImports' , ()=>{
        it('Require a single export' ,()=>{
            const result = coffeImports(`
            const {a} = require "jquery";
            `);
            expect(result[0]).to.eq('jquery')
        })
        it('Require multiple exports' ,()=>{
            const result = coffeImports(`
            const {a,  b,c,d} = require "jquery";
            `);
            expect(result[0]).to.eq('jquery')
        })
        it('Require a single export without extraction' ,()=>{
            const result = coffeImports(`
            const a = require "jquery";
            `);
            expect(result[0]).to.eq('jquery')
        })
    })
});