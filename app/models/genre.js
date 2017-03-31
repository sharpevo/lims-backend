const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GenreSchema = new Schema(
    {
        SYS_LABEL: {
            type: String,
            default: 'label',
            required: true,
            trim: true,
        },

        SYS_IDENTIFIER: {
            type: String,
            match: /^\/[a-zA-Z0-9_\/]*$/,
            required: true,
            trim: true,
            unique: true, // unique and index
        },

        // Since it's difficult to create genres based on the async flow.
        // And the entity is easy to parse via the identifier.
        // -> using promise
        SYS_ENTITY: {
            type: Schema.ObjectId,
            ref: 'Entity',
        },

        // It's debatable that we really want two sets of pointers as they
        // may get out of sync
        //SYS_ATTRIBUTE_LIST: [{
        //type: Schema.ObjectId,
        //ref: 'Attribute',
        //}],

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
        collection: "genre"
    }
)

GenreSchema
    .virtual('SYS_ENTITY_IDENTIFIER')
    .get(function(){
        if (this.SYS_IDENTIFIER){
            return this.SYS_IDENTIFIER.substr(0,this.SYS_IDENTIFIER.lastIndexOf("/"))
        } else{
            return ""
        }
    })

GenreSchema.set(
    'toJSON', 
    {
        getters: true,
        virtuals: true
    })

mongoose.model('Genre', GenreSchema)
