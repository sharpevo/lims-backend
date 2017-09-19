const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EntitySchema = new Schema(
    {
        ////
        // APPLICATION CONVENTION
        ////

        // SYS_LABEL is an expression in nature, in order to show the entity in frontend.
        // It consits of other attributes in the entity, for example, the SYS_LABEL of 
        // sample entity should be the `${SN}`
        SYS_LABEL: {
            type: String,
            default: "label",
            required: true,
            trim: true,
        },

        // SYS_ID is generated by the Genre of entity and the SYS_CODE
        // Normally, SYS_ID = Genre + SYS_CODE, if there's a tailing slash in the Genre.
        // It should be generated automatically, and only expose the SYS_CODE to end user.
        SYS_IDENTIFIER: {
            type: String,
            match: /^\/[a-zA-Z0-9_\.\/]*$/,
            required: true,
            trim: true,
            unique: true, // unique and index
        },

        SYS_ENTITY_TYPE: {
            type: String,
            required: true,
            trim: true,
        },

        // Parents in different paths
        // - identifier
        // - id string -> 
        // - objectid
        // [
        //   "58db71b5f8d94e2a89f39f28,58db71b5f8d94e2a89f39f0a",
        //   "58db71b5f8d94e2a89f39f28,58db71b5f8d94e2a89f39f0a",
        // ]
        SYS_PARENT_LIST: [{
            type: String,
        }],


        // Genre that provides attributes for the current entity.
        // for the APIs:
        // - /genre/xxx/entity, get all the entities for the genre
        // - /entity/xxx/attribute, syntax sugar for the /entity/xxx/genre/xxx/attribute
        SYS_GENRE: {
            type: Schema.ObjectId,
            ref: 'Genre',
            //required: true, // the root entity does not generate from any genre.
        },

        // Genres that owned by the entity.
        // Each entity is allowed to have multiple genres.
        // commented for the reson as same as the attribute-genre
        // i.e. avoid two sets of pointers
        //SYS_GENRE_LIST: [{
        //type: Schema.ObjectId,
        //ref: 'Genre',
        //}],

        //SYS_GENRE_IDENTIFIER: {
        //type: String,
        //set: function(){
        //if (this.SYS_IDENTIFIER){
        //return this.SYS_IDENTIFIER.substr(0,this.SYS_IDENTIFIER.lastIndexOf("/")+1)
        //} else{
        //return ">>>"
        //}
        //}
        //},

        SYS_CAPTURE_CODE: {
            type: String,
        },
        SYS_LANE_CODE: {
            type: String,
        },
        SYS_RUN_CODE: {
            type: String,
        },


        ////
        // PRESET FUNCTION ATTRIBUTES
        ////

        createdAt: {
            type: Date,
            default: Date.now
        },

        updatedAt: {
            type: Date,
            default: Date.now
        },

        enable: {
            type: Boolean,
        },

        visible: {
            type: Boolean,
        },

        deleted: {
            type: Boolean,
        }

    },

    // options
    {
        strict: false,
        collection: 'entity',
    }
)

// SYS_CODE is used to match unique attributes for entities
// e.g., EXTRACT_COMPLETE_DATE.
EntitySchema
    .virtual('SYS_CODE')
    .get(function(){
        // e.g.
        // 1. SYS_IDENTIFIER = "/WORKCENTER/PRODUCT/TEST/V1/17R00221", -> "17R00221"
        // 2. SYS_IDENTIFIER = "/WORKCENTER/PRODUCT/TEST/V1/", -> ""
        if (this.SYS_IDENTIFIER) {
            elements = this.SYS_IDENTIFIER.split("/")
            return elements[elements.length - 1]
        } else {
            return ""
        }
    })

// SYS_GENRE_IDENTIFIER is NOT used to get the attribute list from genre
// collection right now, but helps to create objects under the current object
// with SYS_IDENTIFIER
EntitySchema
    .virtual('SYS_GENRE_IDENTIFIER')
    .get(function(){
        // e.g.
        // 1. SYS_IDENTIFIER = "/WORKCENTER/PRODUCT/TEST/V1/17R00221",
        //    -> "/WORKCENTER/PRODUCT/TEST/V1/"
        // 2. SYS_IDENTIFIER = "/WORKCENTER/PRODUCT/TEST/V1/",
        //    -> "/WORKCENTER/PRODUCT/TEST/V1/"
        if (this.SYS_IDENTIFIER){
            return this.SYS_IDENTIFIER.substr(0,this.SYS_IDENTIFIER.lastIndexOf("/")+1)
        } else{
            return ""
        }

    })

EntitySchema
    .virtual('SYS_HYBRID_INFO')
    .get(function(){

        let runString = 'SYS_RUN_CODE'
        let lanString = 'SYS_LANE_CODE'
        let capString = 'SYS_CAPTURE_CODE'
        let runCode = this[runString]
        let lanCode = this[lanString]
        let capCode = this[capString]

        //console.log("...", obj)
        //console.log("..", JSON.stringify(this))
        if (runCode){
            return {
                "type":"RUN",
                "HYBRID_CODE": runString,
                [runString]: runCode
            }
        }
        if (lanCode){
            return {
                "type":"LANE",
                "HYBRID_CODE": lanString,
                [lanString]: lanCode
            }
        }
        if (capCode){
            return {
                "type":"CAPTURE",
                "HYBRID_CODE": capString,
                [capString]: capCode
            }
        }
        return {}

    })

EntitySchema.set(
    'toJSON', 
    {
        getters: true,
        virtuals: true
    }
)

EntitySchema.set(
    'toObject',
    {
        getters: true,
        virtuals: true
    }
)
mongoose.model('Entity', EntitySchema)
