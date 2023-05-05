# Ontology and SPARQL grammar

## SPARQL_edit Ontology

The [ontology](spedit-ontology.ttl) defines the class and properties for the representation of a "SPARQL view" in RDF. 
A "SPARQL view" is a simple configuration object that defines how to load a table of values from a SPARQL endpoint with the SPARQL_edit app.

## Restricted SPARQL grammar

The SPARQL_edit algorithm only supports a subset of the SPARQL grammar. The grammar definitions that differ from the [original SPARQL 1.1 grammar](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#sparqlGrammar) rules are listet in the document [sparql_grammar_diff.html](sparql_grammar_diff.html).

The app should give feedback to the user if his/her query can be used by the algorithm. Therefore, a grammar checking must warn, if the entered query does not conform to the SPARQL grammar restrictions. Since version v0.6, SPARQL_edit uses a grammar check that is integrated into the embedded [Yasgui SPARQL editor](https://triply.cc/docs/yasgui) called YASQE. 

The [YASQE project](https://github.com/TriplyDB/Yasgui/tree/master/packages/yasqe) implements the SPARQL grammar with the logic programming language [Prolog](https://en.wikipedia.org/wiki/Prolog). The grammar rules which are written in the [Extended Backus-Naur Form (EBNF)](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) in the [SPARQL 1.1 specification](https://www.w3.org/TR/sparql11-query/#grammar) have been translated to Prolog rules: [sparql11-grammar.pl](https://github.com/TriplyDB/Yasgui/blob/master/packages/yasqe/grammar/sparql11-grammar.pl). When executed with [SWI-Prolog](https://en.wikipedia.org/wiki/SWI-Prolog), these Prolog rules build the JavaScript tokenizer table for the JavaScript library.

In a fork of the Yasgui GitHub project, the Prolog rules have been modified in order to describe the restricted SARQL grammar for SPARQL_edit and rebuild the tokenizer table for the YASQE library. SPARQL_edit uses the build of the forked repository to mark unsupported language features in the query editor for the user.

