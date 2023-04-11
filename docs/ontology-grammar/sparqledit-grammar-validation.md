# Restricted SPARQL grammar for SPARQL_edit

The SPARQL_edit algorithm only supports a subset of the SPARQL grammar. The app should give feedback to the user if his/her query can be used by the algorithm. Therefore, a grammar checking must validate, if the entered query conforms to the SPARQL grammar restrictions of SPARQL_edit and give a warning if unsupported language features are used.

There are three possible solutions:
1. Modify the YASQE library to use restricted grammar
2. Write a SPARQL parser with restricted grammar similar to SPARQL.js
3. Assert the JavaScript object from SPARQL.js parsing with own JS rules


## 1. Ideal solution: YASQE editor with modified grammar

The ideal solution is a grammar check that is integrated into the embedded [Yasgui SPARQL editor](https://triply.cc/docs/yasgui), called YASQE. 

The [YASQE project](https://github.com/TriplyDB/Yasgui/tree/master/packages/yasqe) implements the SPARQL grammar with the logic programming language [Prolog](https://en.wikipedia.org/wiki/Prolog). The grammar rules which are written in the [Extended Backus-Naur Form (EBNF)](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) in the [SPARQL 1.1 specification](https://www.w3.org/TR/sparql11-query/#grammar) have been translated to Prolog rules: [sparql11-grammar.pl](https://github.com/TriplyDB/Yasgui/blob/master/packages/yasqe/grammar/sparql11-grammar.pl). When executed with [SWI-Prolog](https://en.wikipedia.org/wiki/SWI-Prolog), these Prolog rules build the JavaScript tokenizer table for the JavaScript library.

The idea was to modify the Prolog rules in order to describe the restricted SARQL grammar for SPARQL_edit and rebuild the tokenizer table for the YASQE library. The SPARQL editor would then use the modified grammar and mark unsupported language features for the user.

__Problem:__ [Error building the grammar/tokenizer-table](https://github.com/TriplyDB/Yasgui/issues/206)
> I would like my YASQE component to only support/allow a subset of the SPARQL grammar. My plan was to change the Prolog grammar (sparql11-grammar.pl) based on my EBNF rules. Then I could re-run the grammar build script to create a new JavaScript tokenizer table (_tokenizer-table.js).
> 
> Unfortunately, the grammar build script fails even without any changes.
> swipl -s util/gen_sparql11.pl -t go
> 
> I am using swipl version 8.4 on Ubuntu.
> SWI-Prolog version 8.4.3 for x86_64-linux
> 
> This is the error message:
> 
> ERROR: assertz/1: Type error: `callable' expected, found `[]' (an empty_list)
>    Exception: (9) *'or([baseDecl,prefixDecl])'===>_5748 ?
> What could I do to solve this problem?


## 2. Alternative solution: SPARQL parser similar to SPARQL.js

Ruben Verborgh's [SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js/) is a parser for the SPARQL query language in JavaScript. AS described in his [blog post](https://ruben.verborgh.org/blog/2014/08/22/writing-a-sparql-parser-in-javascript/), [Jison](https://github.com/zaach/jison) was used to create a parser generator.

A script translated the EBNF rules from the [SPARQL 1.1 specification](https://www.w3.org/TR/sparql11-query/#grammar) into a .jison document. JISON then creates a JavaScript parser from this document. These files can be found in the [second commit of SPARQL.js](https://github.com/RubenVerborgh/SPARQL.js/tree/b035a3d2ae8a7c440454be48b83feacfb96a5bac).

The idea was to replicate this procedure with modified EBNF rules which express the subset of the original SPARQL grammar for SPARQL_edit. The resulting parser for the restricted grammar would be called for validation whenever the user makes a change to the YASQE query editor.

__Problem:__ After the initial tranlation from EBNF to Jison, many improvements and bug fixes have been done to the generated JISON rules. 
This can be seen looking at the [commit history](https://github.com/RubenVerborgh/SPARQL.js/commits/main?after=66c1d26d2bc289f1bd414dcfca0383dc7cf368bc+384&branch=main&qualified_name=refs%2Fheads%2Fmain). 


## 3. Workaround: Assertions on parsed query object in JavaScript

A workaround for the validating of SPARQL queries can be implemented with SPARQL.js in JavaScript. The query string is parsed into a JavaScript object using SPARQL.js. The JS query object is then validated with a collection of if-else statements. Although this workaround might be incomplete and error-prone, it can be used to easily implement a first validation if the query is supported by the SPARQL_edit algorithm.