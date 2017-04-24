const {Ply, PlyElement, PlyProperty} = (function () {

    /**
     * Store an element properties
     */
    class Element {
        /**
         * @param args either a string defining an Element in a .ply file (example: element vertex 8)
         *  or an object with "properties" (Array), "name" (String) and "count" (Int) attributes.
         */
        constructor(args) {
            if ((typeof args === 'string' || args instanceof String)) {
                this.properties = [];
                const data = args.split(/\s+/);
                this.name = data[1];
                this.count = parseInt(data[2]);
            } else {
                this.properties = args.properties | [];
                this.name = args.name;
                this.count = args.count;
                if (!this.count) this.count = 0;
            }
        }
    }

    /**
     * Store a property name and type
     */
    class Property {
        /**
         * @param args Object|String
         *  Either a string defining a property in a .ply file (example: property float x)
         *  Or an object with the attributes "isList", "listCountType", "name" and "type"
         */
        constructor(args) {
            if ((typeof args === 'string' || args instanceof String)) {
                const propertyDefinition = args.split(/\s+/);

                if (propertyDefinition[1] === "list") {
                    this.isList = true;
                    this.listCountType = propertyDefinition[2];
                    this.type = propertyDefinition[3];
                    this.name = propertyDefinition[4];
                }
                else {
                    this.isList = false;
                    this.type = propertyDefinition[1];
                    this.name = propertyDefinition[2];
                }

            } else {
                this.isList = !!args.isList;
                this.listCountType = args.listCountType;
                this.name = args.name;
                this.type = args.type;
            }
        }
    }

    /**
     * Read the header, check that the format (if defined) matches "ascii 1.0" and return a list of
     * Elements and a list of comments
     * @param header
     */
    const readHeader = function (header) {
        let elementsList = [];
        let commentList = [];
        let currentElement = null;

        header.split("\n").forEach((line) => {
            const keyWord = line.substr(0, line.search(/\s+/));

            switch (keyWord) {
                case "format":
                    if (!line.match(/\s*format\s+ascii\s+1.0\s*/)) {
                        console.warn(line, " does not match", "format ascii 1.0");
                    }
                    break;
                case "element":
                    currentElement = new Element(line);
                    elementsList.push(currentElement);
                    break;
                case "property":
                    currentElement.properties.push(new Property(line));
                    break;
                case "comment":
                    commentList.push(line.substr(line.search(/\s+/)+1));
                    break;
                default :
                    break;
            }
        });

        console.log({elementsList: elementsList, commentList: commentList});
        return {elementsList: elementsList, commentList: commentList};
    };

    /**
     * Return a model from a list of Element ans the ascii body of a .ply file.
     * @param schema list of Element
     * @param bodyData .pls body as string
     * @returns Object {elementName1 : [{e1Property1, e1Property2,...}, ...], ...}
     */
    const getModel = function (schema, bodyData) {
        let model = {};

        let elementOffset = 0;
        let lines = bodyData.split("\n");

        schema.forEach((element) => {
            model[element.name] = [];

            //forEach line of the current element
            lines.slice(elementOffset, elementOffset + element.count).forEach((line) => {
                model[element.name].push({});

                const propertiesValues = line.split(/\s+/);
                element.properties.forEach((property) => {

                    if (property.isList) {
                        //model.elementName[$last].property.name
                        const listCount = propertiesValues.shift();
                        model[element.name][model[element.name].length - 1][property.name] = propertiesValues.splice(0, listCount);
                    } else {
                        model[element.name][model[element.name].length - 1][property.name] = propertiesValues.shift();
                    }

                });
            });

            elementOffset += element.count;
        });

        return model;
    };

    /**
     * Structure for ply files, .ply as string loader (TODO: and writer)
     */
    class Ply {
        constructor(plyString) {
            this.schema = [];
            this.model = {};
            this.comments = [];

            if (plyString) {
                this.read(plyString);
            }
        }

        /**
         * Load an ascii ply file as a String to build a model
         *
         * @param plyString an ascii .ply file as a string
         */
        read(plyString) {
            if (!(typeof plyString === 'string' || plyString instanceof String)) {
                throw "Model should be a string";
            }

            const parts = plyString.split(/\s+end_header\s+/);

            const header = readHeader(parts[0]);
            this.schema = header.elementsList;
            this.comments = header.commentList;

            this.model = getModel(this.schema, parts[1]);
        }

        /**
         * Return a String representing a .ply file from this.schema and this.model
         *
         * @returns {string}
         */
        write() {
            let plyString = "ply\n" +
                "format ascii 1.0\n" +
                "comment generated by PlyJS\n";

            this.comments.forEach((comment) => {
                plyString += "comment " + comment +"\n";
            });

            this.schema.forEach((element) => {
                plyString += "element " + element.name + " " + element.count + "\n";

                element.properties.forEach((property) => {
                    plyString += "property " + property.type + " " + property.name + "\n";
                });
            });

            plyString += "end_header\n";

            //for Each Element in the schema
            this.schema.forEach((element) => {
                //for Each ElementValue in the model
                this.model[element.name].forEach((elementValue) => {
                    //forEach Property in the schema
                    element.properties.forEach((property, index, properties) => {
                        if (property.isList) {
                            plyString += elementValue[property.name].length + " ";
                            plyString += elementValue[property.name].join(" ");
                        } else {
                            plyString += elementValue[property.name]
                        }

                        if(index === properties.length-1) {//if last property
                            plyString += "\n";
                        } else {
                            plyString += " ";
                        }
                    });
                });
            });

            return plyString;
        }
    }

    return {Ply, Element, Property};
})();
