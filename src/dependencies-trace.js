const {RegExpFactory} = require('create-regex');
const WORD_WITH_NUMBER_SUFFIX = /([\s\S]+?)(?:\d+)?$/;
const REMOVE_STRING_SIGNS = /('|`|")/g

const TS_REGEX = createImportsRegex({});
const COFFE_REGEX = createImportsRegex({coffeScript : true});
const coffeImports = createImportsExtractor(COFFE_REGEX);
const tsImports = createImportsExtractor(TS_REGEX)
module.exports = {
    tsRegex: TS_REGEX,
    coffeRegex: COFFE_REGEX,
    tsImports,
    jsImports: tsImports,
    coffeImports
}

function createImportsExtractor(regex){
    return (str)=>{
        return removeStringSignsFromPathAndRemoveComments(matchAndExtractAll(str , regex))
    }
}

function removeStringSignsFromPathAndRemoveComments(array){
    const newArray = [];
    for (let index = 0; index < array.length; index++) {
        const obj = array[index];
        if (obj.path){
            obj.path = obj.path.replace(REMOVE_STRING_SIGNS , '');
            newArray.push(obj.path);
        }
    }
    return newArray;
}

function createImportsRegex({
    stringSigns,
    pathPattern,
    coffeScript
}){ 
    const rBuild = new RegExpFactory({
        RegExp : RegExp,
        mixins : {
            stringSigns : stringSigns || ['\'','"','`'],
            pathPattern : pathPattern || '[\\w\\.\\/_-]+?',
        }
    });
    
    return rBuild.create(({indexedGroupFactory,nonCaptureGroup,nonCaptureGroupWithSeperator,group,groupWithSeperator,wrapPattern,stringSigns,pathPattern})=>{
        /*
        The file path group will be used in more then one occurrence
        The `indexedGroupFactory` is curying function the is increased by 1 when used
        We use it because in RegExp we cannot use the same group name
        Laster we will remove the index from results - so it will look the same name
        */
        const createPathGroup = indexedGroupFactory((index)=>
            group('path'+index,
                wrapPattern(pathPattern,stringSigns)
            )
        )
        /*
        The decalration part of the require action will be used more then one occurrence
        The declaration part might look something like : `const {a,r} =` or `var a=`
        This part of the regex should handle most common patterns
        */
       const createIdentifierGroup = indexedGroupFactory((index)=>
       nonCaptureGroupWithSeperator(`[\\w\\$]+?`)
        )
        const createVarDeclare = ()=>
            nonCaptureGroupWithSeperator([
                `\\s*?${
                    nonCaptureGroupWithSeperator(['var','let','const'],'|')
                }\\s+${
                    nonCaptureGroupWithSeperator([
                        createIdentifierGroup(),
                        `\\{ *(?:${createIdentifierGroup()}|(?: *, *))* *\\}`,
                    ])
                }\\s*=\\s*`,
            ],'|');
        /*
        The `create` method here will create the actual aub pattern 
        to match the positive part of our pattern.
        It accepts a `condition` because RegExp can't have two groups
        with the same name.
        */
        function create(condition){
            return nonCaptureGroupWithSeperator([
                groupWithSeperator(`${condition}_import`,[
                    ` +(?:\\*|${createIdentifierGroup()}?) +as +${createIdentifierGroup()} +from +${createPathGroup()}`,
                    ` *\\{ *(?:(?:(?:${
                        nonCaptureGroupWithSeperator([
                            createIdentifierGroup(),
                            ','
                        ])
                    }+))|(?: +(?:\\*|${createIdentifierGroup()}?) +as +${createIdentifierGroup()} +)) *\\} *from +${createPathGroup()}`,
                    `import +(?:${createIdentifierGroup()} +from +)?${createPathGroup()}`,
                ] , '|'),
                groupWithSeperator(`${condition}_require`,[
                    coffeScript ? `${createVarDeclare()}require\\s+${createPathGroup()}` : null
                    ,
                    `${createVarDeclare()}require\\(\\s*${createPathGroup()}\\s*\\)`,
                    `require\\(\\s*${createPathGroup()}\\s*\\)`
                ] , '|')
            ])
        }
        /*
        Because we want to remove comments from our matches
        While JS RegExp doesn't support negative look ahead and behind.
        The way to produce simillar result is find our undesired results
        first and then ignore these during matches.
        */
        return nonCaptureGroupWithSeperator([
            // First we match multi line comments
            nonCaptureGroup(`\\/\\*[\\s\\S]*?\\*+\\/`),
            // First we match one line comments
            nonCaptureGroup(`\\/\\/+[ \\t\\r\\f\\S]+`),
            // Last we match the positive pattern (with what that is left)
            group(`positive`,create('positive')),
        ] , '|')
    },
    //The `img` are flags (`i` - case insensitive , `m` - multi line , `g` - global serach)
    'img');
}

function extractWordFromKey(key){
    const match = key.match(WORD_WITH_NUMBER_SUFFIX);
    if (match){
        return match[1]
    }
}
function groupWithoutIndexing(map , keys){
    const o = {};
    keys = keys || Object.keys(map);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const cleanKey = extractWordFromKey(key);
        if (o[cleanKey] === undefined){
            o[cleanKey] = map[key]; 
        }
    }
    return o;
}
function onlyNamesGroupWithoutIndex(match , keys){
    return groupWithoutIndexing(match ? match.groups : {} , keys);
}

function matchAndExtractAll(str , regex){
    // const matches = [...string.matchAll(regex)];
    let match;
    let keys;
    const results = []
    regex.index = 0;
    while ((match = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        if (!keys && match){
            keys = Object.keys(match.groups);
        }
        
        results.push(
            onlyNamesGroupWithoutIndex(match , keys)
        )
    }
    return results
}