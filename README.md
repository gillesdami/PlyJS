# PlyJS
One file .ply ascii importer and exporter without any dependencies in ES6.  
Does not directly load files but strings.  
Simple and light, based upon [this](http://paulbourke.net/dataformats/ply/) definition.  

## License: MIT
## Doc
### class Ply
 * __constructor(plyString)__
    * optional String plyString the ascii .ply file as a string
 * __read(plyString)__
    * String plyString the ascii .ply file as a string
 * __write():plyString__
    * String plyString the ascii .ply file as a string
 * __Array[PlyElement] schema__ represent the plyFile structure
 * __Object model__ the model, see the example bellow
 ```
 {
  vertex: [
   {
     x: 0, 
     y: 0,
     z: 1
    }, 
   {
     x: 1, 
     y: 0,
     z: 1
  ], 
  edges: [
    {
      edgeAsList: [0,1]
    }
  ]
 }
 ```
 * __Array[String] comments__ comments...

### class PlyElement
 * __constructor(args)__
    * String args a line of a .ply file starting by element
    * [or]Object args {properties: Array[PlyProperty], name: String, count: Int}
 * __Array[PlyProperty] properties__ List of properties that define the element
 * __String name__ Element name
 * __Int count__ Number of entries of the given element in the data

### class PlyProperty
 * __constructor(args)__
    * String args a line of a .ply file starting by property
    * [or]Object args {isList: Bool, listCountType: String|Undefined, name: String, type: String}
 * __Bool isList__ True if the property is a list
 * __String listCountType__ Type of the list lenght data or undefined if the property isn't a list
 * __String name__ Property name
 * __String type__ Type of the (list) propert(y|ies)
