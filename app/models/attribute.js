const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AttributeSchema = new Schema(
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

        // SYS_CODE is the field name in mongodb
        SYS_CODE: {
            type: String,
            match: /^[a-zA-Z0-9_]+$/,
            required: true,
            trim: true,
        },

        SYS_ORDER: {
            type: Number,
            default: 1,
            required: true
        },

        SYS_REQUIRED: {
            type: Boolean,
            default: false,
            required: true,
        },

        // Specify the SYS_LABEL for the entity
        SYS_IS_ENTITY_LABEL: {
            type: Boolean,
            default: false,
        },

        SYS_GENRE: {
            type: Schema.ObjectId,
            ref: 'Genre',
            required: true,
        },

        // Attribute type, e.g., text, number, entity, etc.
        SYS_TYPE: {
            type: String,
            required: true,
        },

        SYS_TYPE_LIST:{
            type: String,
        },

        // Entity list retrived while creating new entity, if the SYS_TYPE is entity,
        // will be generated from the ceiling entity to the floor entity type
        SYS_TYPE_ENTITY: {
            type: Schema.ObjectId,
            ref: 'Entity',
        },

        // Indicate the expandabality for the sub entities
        SYS_TYPE_ENTITY_REF: {
            type: Boolean,
            default: true,
        },

        // Specify the type of entity candidate
        // anyone of domain, class, collection, is supported.
        SYS_FLOOR_ENTITY_TYPE: {
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
        collection: 'attribute',
    }
)

AttributeSchema.set(
    'toJSON', 
    {
        getters: true,
        virtuals: true
    }
)

mongoose.model('Attribute', AttributeSchema)
