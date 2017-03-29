const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')

const ENTITY_TYPE = {
    0: "domain",
    1: "class",
    2: "collection",
    3: "object",
}

function addAttribute(attr, genre){
    Attribute.create(
        attr,
        (err, attr) => {
            genre.SYS_ATTRIBUTE_LIST.push(attr)
            genre.save()
        }
    )
}

function createGenre(entity){
    return Genre({
        SYS_IDENTIFIER: entity.SYS_IDENTIFIER + "/",
        SYS_ENTITY: entity.id,
        label: entity.label + " Genre",
    })
        .save()
        .then((genre) => {
            entity.SYS_GENRE_LIST.push(genre)
            entity.save()
            return genre
        })
}

function createEntity(identifier, typeIndex, label){
    return Entity({
        SYS_IDENTIFIER: identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[typeIndex],
        label: label,
    })
        .save()
}

module.exports = function(){
    Genre.findOne({}, (err, found) => {
        if (found) {
            return
        }

        console.log(">>> Building test database...")

        // "/"
        Genre({
            title: "Domain",
            SYS_IDENTIFIER: "/",
            SYS_LABEL: "title",
        })
            .save()
            .then((genre) => {
                Attribute({
                    label: '领域名称',
                    SYS_CODE: 'label',
                    SYS_TYPE: 'text',
                    SYS_GENRE: genre.id
                }).save((err, attr) => {
                    if (err){
                        console.error(err)
                    }
                    genre.SYS_ATTRIBUTE_LIST.push(attr)
                    return genre.save()
                })
            }).catch((err) => {
                console.error(err)
            })

        createEntity("/RESOURCE",0, "Resources")
            .then((resourceEntity) => {
                createGenre(resourceEntity)
                    .then((resourceGenre) => {

                        // HUMAN
                        createEntity(resourceGenre.SYS_IDENTIFIER + "HUMAN", 1, "Human " + resourceGenre.label)
                            .then((humanEntity) => {
                                createGenre(humanEntity)
                                    .then((humanGenre) => {
                                        createEntity(humanGenre.SYS_IDENTIFIER + "PRODUCT", 2, "Product " + humanGenre.label)
                                            .then((productEntity) => {
                                                createGenre(productEntity)
                                                    .then((productGenre) => {
                                                        createEntity(productGenre.SYS_IDENTIFIER + "001", 3, "Neville")
                                                        createEntity(productGenre.SYS_IDENTIFIER + "002", 3, "Luna ")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        // INSTRUMENT
                        createEntity(resourceGenre.SYS_IDENTIFIER + "INSTRUMENT", 1, "Instrument " + resourceGenre.label)
                            .then((humanEntity) => {
                                createGenre(humanEntity)
                                    .then((humanGenre) => {

                                        // SHEARING
                                        createEntity(humanGenre.SYS_IDENTIFIER + "SHEARING", 2, "Shearing " + humanGenre.label)
                                            .then((productEntity) => {
                                                createGenre(productEntity)
                                                    .then((productGenre) => {
                                                        createEntity(productGenre.SYS_IDENTIFIER + "COVARIS_II", 3, "Covaris II")
                                                        createEntity(productGenre.SYS_IDENTIFIER + "METARUPTOR_I", 3, "Metaruptor I")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // GUN
                                        createEntity(humanGenre.SYS_IDENTIFIER + "GUN", 2, "Gun " + humanGenre.label)
                                            .then((productEntity) => {
                                                createGenre(productEntity)
                                                    .then((productGenre) => {
                                                        createEntity(productGenre.SYS_IDENTIFIER + "LIAN_HUA", 3, "Lian Hua")
                                                        createEntity(productGenre.SYS_IDENTIFIER + "BAI_DE", 3, "Bai De")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // SEQUENCE
                                        createEntity(humanGenre.SYS_IDENTIFIER + "SEQUENCING", 2, "Sequencing " + humanGenre.label)
                                            .then((productEntity) => {
                                                createGenre(productEntity)
                                                    .then((productGenre) => {
                                                        createEntity(productGenre.SYS_IDENTIFIER + "NovaSeq_1", 3, "NovaSeq #1")
                                                        createEntity(productGenre.SYS_IDENTIFIER + "NovaSeq_2", 3, "NovaSeq #2")
                                                        createEntity(productGenre.SYS_IDENTIFIER + "HiSeqX10", 3, "HiSeq X10")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                    }).catch((err) => {
                        console.log(err)
                    })

            }).catch((err) => {
                console.log(err)
            })

        // "/PURCHASE"
        createEntity("/PURCHASE",0, "Purchase")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // SUPPLIER
                        createEntity(domainGenre.SYS_IDENTIFIER + "SUPPLIER", 1, "Supplier " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // LOCAL
                                        createEntity(classGenre.SYS_IDENTIFIER + "LOCAL", 2, "Local " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        createEntity(collectionGenre.SYS_IDENTIFIER + "001", 3, "in Beijing")
                                                        createEntity(collectionGenre.SYS_IDENTIFIER + "002", 3, "in Hangzhao")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // Foreign
                                        createEntity(classGenre.SYS_IDENTIFIER + "FOREIGN", 2, "Foreign " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        createEntity(collectionGenre.SYS_IDENTIFIER + "001", 3, "in USA")
                                                        createEntity(collectionGenre.SYS_IDENTIFIER + "002", 3, "in UK")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        // ORDER
                        createEntity(domainGenre.SYS_IDENTIFIER + "ORDER", 1, "Order " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // DEFAULT
                                        createEntity(classGenre.SYS_IDENTIFIER + "DEFAULT", 2, "Default " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        // Implement manually w/ operator and supplier
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })
                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })


        // MATERIAL
        createEntity("/MATERIAL",0, "Material")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // KAPA
                        createEntity(domainGenre.SYS_IDENTIFIER + "KAPA", 1, "Kapa Hifi " + domainGenre.label)
                            .then((kapaEntity) =>{
                                createGenre(kapaEntity)
                                    .then((kapaGenre) => {
                                        createEntity(kapaGenre.SYS_IDENTIFIER + "LOT160806", 2, "LOT160806")
                                        createEntity(kapaGenre.SYS_IDENTIFIER + "LOT170312", 2, "LOT170312")
                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        // EXONUCLEASE
                        createEntity(domainGenre.SYS_IDENTIFIER + "EXONUCLEASE", 1, " Exonuclease " + domainGenre.label)
                            .then((kapaEntity) =>{
                                createGenre(kapaEntity)
                                    .then((kapaGenre) => {
                                        createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")
                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        //// ENZYME
                        //createEntity(domainGenre.SYS_IDENTIFIER + "ENZYME", 1, "Enzyme " + domainGenre.label)
                        //.then((classEntity) => {
                        //createGenre(classEntity)
                        //.then((classGenre) => {

                        //// KAPA
                        //createEntity(classGenre.SYS_IDENTIFIER + "KAPA", 2, "Kapa " + classGenre.label)
                        //.then((collectionEntity) => {
                        //createGenre(collectionEntity)
                        //.then((collectionGenre) => {
                        ////createEntity(collectionGenre.SYS_IDENTIFIER + "LOT160806", 3, "LOT160806")
                        ////createEntity(collectionGenre.SYS_IDENTIFIER + "LOT170302", 3, "LOT170302")
                        //}).catch((err) => {
                        //console.log(err)
                        //})

                        //}).catch((err) => {
                        //console.log(err)
                        //})

                        //// EXONUCLEASE
                        //createEntity(classGenre.SYS_IDENTIFIER + "EXONUCLEASE", 2, "Exonuclease " + classGenre.label)
                        //.then((collectionEntity) => {
                        //createGenre(collectionEntity)
                        //.then((collectionGenre) => {
                        ////createEntity(collectionGenre.SYS_IDENTIFIER + "001", 3, "in USA")
                        ////createEntity(collectionGenre.SYS_IDENTIFIER + "002", 3, "in UK")
                        //}).catch((err) => {
                        //console.log(err)
                        //})

                        //}).catch((err) => {
                        //console.log(err)
                        //})

                        //}).catch((err) => {
                        //console.log(err)
                        //})
                        //}).catch((err) => {
                        //console.log(err)
                        //})

                        // CONSUMABLE
                        createEntity(domainGenre.SYS_IDENTIFIER + "CONSUMABLE", 1, "Consumable " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // GLOVE
                                        createEntity(classGenre.SYS_IDENTIFIER + "GLOVE", 2, "Glove " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // TIP
                                        createEntity(classGenre.SYS_IDENTIFIER + "TIP", 2, "Tip " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // PRIMER
                                        createEntity(classGenre.SYS_IDENTIFIER + "PRIMER", 2, "Primer " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })
                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })

        // BOM
        createEntity("/BOM",0, "BoMs")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // SALE
                        createEntity(domainGenre.SYS_IDENTIFIER + "SALE", 1, "Sale " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        // MANUFACTURING
                        createEntity(domainGenre.SYS_IDENTIFIER + "MANUFACTURING", 1, "Manufacturing " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // LIBRARY
                                        createEntity(classGenre.SYS_IDENTIFIER + "LIBRARY_V1", 2, "Library V1 " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // EXTRACT
                                        createEntity(classGenre.SYS_IDENTIFIER + "EXTRACT_V1", 2, "Extract V1 " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })


                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })
                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })

        // WORKCENTER
        createEntity("/WORKCENTER",0, "WorkCenters")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // PRODUCT
                        createEntity(domainGenre.SYS_IDENTIFIER + "PRODUCT", 1, "Product " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // EXTRACT_ASSIGN
                                        createEntity(classGenre.SYS_IDENTIFIER + "EXTRACT_ASSIGN", 2, "Extract Assign " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // EXTRACT_RESULT
                                        createEntity(classGenre.SYS_IDENTIFIER + "EXTRACT_RESULT", 2, "Extract Result " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // LIBRARY
                                        createEntity(classGenre.SYS_IDENTIFIER + "LIBRARY", 2, "Library " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        // SEQUENCE
                                        createEntity(classGenre.SYS_IDENTIFIER + "SEQUENCE", 2, "Sequence " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })
                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })
                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })

        // ROUTING
        createEntity("/ROUTING",0, "Routings")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // PRODUCT
                        createEntity(domainGenre.SYS_IDENTIFIER + "PRODUCT", 1, "Product " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // PRODUCT ROUTING V1
                                        createEntity(classGenre.SYS_IDENTIFIER + "V1", 2, "V1 " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })
                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })

        // SALE
        createEntity("/SALE",0, "Sales")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // Client
                        createEntity(domainGenre.SYS_IDENTIFIER + "CLIENT", 1, "Client " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // EXTERNAL
                                        createEntity(classGenre.SYS_IDENTIFIER + "EXTERNAL", 2, "External " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        // CONTRACT
                        createEntity(domainGenre.SYS_IDENTIFIER + "CONTRACT", 1, "Contract " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // TECHNOLOGY SERVICE
                                        createEntity(classGenre.SYS_IDENTIFIER + "TECHNOLOGY_SERVICE", 2, "Technology Service " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        // BATCH
                        createEntity(domainGenre.SYS_IDENTIFIER + "BATCH", 1, "Batch " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // DEFAULT
                                        createEntity(classGenre.SYS_IDENTIFIER + "DEFAULT", 2, "Default " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })

        // SAMPLE
        createEntity("/SAMPLE",0, "Samples")
            .then((domainEntity) => {
                createGenre(domainEntity)
                    .then((domainGenre) => {

                        // DEFALUT
                        createEntity(domainGenre.SYS_IDENTIFIER + "DEFAULT", 1, "Default Class " + domainGenre.label)
                            .then((classEntity) => {
                                createGenre(classEntity)
                                    .then((classGenre) => {

                                        // DEFAULT
                                        createEntity(classGenre.SYS_IDENTIFIER + "DEFAULT", 2, "Default Collection " + classGenre.label)
                                            .then((collectionEntity) => {
                                                createGenre(collectionEntity)
                                                    .then((collectionGenre) => {
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })

                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })
                    }).catch((err) => {
                        console.log(err)
                    })
            }).catch((err) => {
                console.log(err)
            })


        console.log(">>> Done!")
    })

}
