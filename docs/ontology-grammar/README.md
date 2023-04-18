# Ontology and SPARQL grammar

## SPARQL_edit Ontology

The [ontology](spedit-ontology.ttl) defines the class and properties for the representation of a "SPARQL view" in RDF. 
A "SPARQL view" is a simple configuration object that defines how to load a table of values from a SPARQL endpoint with the SPARQL_edit app.

## Restricted SPARQL grammar

The SPARQL_edit algorithm only supports a subset of the SPARQL grammar. The grammar definitions that differ from the [original SPARQL 1.1 grammar](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#sparqlGrammar) rules are listet in the document [sparql_grammar_diff.html](sparql_grammar_diff.html).

SPARQL_edit (v0.6 and newer) implements one of three ways for checking if the user-defined SPARQL/Select query conforms to the restricted grammar: [sparqledit-grammar-validation.md](sparqledit-grammar-validation.md)
