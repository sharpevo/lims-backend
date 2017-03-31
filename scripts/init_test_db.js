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
            //genre.SYS_ATTRIBUTE_LIST.push(attr)
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
            //entity.SYS_GENRE_LIST.push(genre)
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
        Entity({
            SYS_IDENTIFIER: "/",
            SYS_ENTITY_TYPE: "/",
            label: "Root",
        })
            .save()
            .then((domainEntity) => {
                Genre({
                    title: "Domain",
                    SYS_IDENTIFIER: "/",
                    SYS_LABEL: "title",
                    SYS_ENTITY: domainEntity,
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
                            //genre.SYS_ATTRIBUTE_LIST.push(attr)
                            return genre.save()
                        })
                    }).catch((err) => {
                        console.error(err)
                    })
            })

        createEntity("/HUMAN_RESOURCE", 0, "Human Resource")
            .then(humanEntity => {

                createGenre(humanEntity)
                    .then(humanGenre => {

                        createEntity(humanGenre.SYS_IDENTIFIER + "PRODUCT", 1, "Product " + humanGenre.label)
                            .then(productEntity => {

                                createGenre(productEntity)
                                    .then(productGenre => {

                                        createEntity(productGenre.SYS_IDENTIFIER + "001", 2, "Neville")
                                        createEntity(productGenre.SYS_IDENTIFIER + "002", 2, "Luna")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                        createEntity(humanGenre.SYS_IDENTIFIER + "RESEARCH", 1, "Research " + humanGenre.label)
                            .then(researchEntity => {

                                createGenre(researchEntity)
                                    .then(researchGenre => {

                                        createEntity(researchGenre.SYS_IDENTIFIER + "003", 2, "Gandalf")
                                        createEntity(researchGenre.SYS_IDENTIFIER + "004", 2, "Lummen")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                    }).catch(err => {
                        console.error(err)
                    })

            }).catch(err => {
                console.error(err)
            })

        createEntity("/INSTRUMENT_RESOURCE", 0, "Instrument Resource")
            .then(instrumentEntity => {

                createGenre(instrumentEntity)
                    .then(instrumentGenre => {

                        createEntity(instrumentGenre.SYS_IDENTIFIER + "SHEARING", 1, "Shearing " + instrumentGenre.label)
                            .then(shearingEntity => {

                                createGenre(shearingEntity)
                                    .then(shearingGenre => {

                                        createEntity(shearingGenre.SYS_IDENTIFIER + "COVARIS_II", 3, "Covaris II")
                                        createEntity(shearingGenre.SYS_IDENTIFIER + "METARUPTOR_I", 3, "Metaruptor I")

                                    }).catch(err => {
                                        console.error(err)
                                    })
                            }).catch(err => {
                                console.error(err)
                            })



                        createEntity(instrumentGenre.SYS_IDENTIFIER + "GUN", 1, "Gun " + instrumentGenre.label)
                            .then(gunEntity => {

                                createGenre(gunEntity)
                                    .then(gunGenre => {

                                        createEntity(gunGenre.SYS_IDENTIFIER + "BAI_DE", 3, "BD_1")
                                        createEntity(gunGenre.SYS_IDENTIFIER + "LIAN_HUA", 3, "LH_2")

                                    }).catch(err => {
                                        console.error(err)
                                    })
                            }).catch(err => {
                                console.error(err)
                            })


                        createEntity(instrumentGenre.SYS_IDENTIFIER + "SEQUENCING", 1, "Sequencing " + instrumentGenre.label)
                            .then(seqEntity => {

                                createGenre(seqEntity)
                                    .then(seqGenre => {

                                        createEntity(seqGenre.SYS_IDENTIFIER + "X10", 3, "HiSeq X10")
                                        createEntity(seqGenre.SYS_IDENTIFIER + "NOVASEQ", 3, "NovaSeq")

                                    }).catch(err => {
                                        console.error(err)
                                    })
                            }).catch(err => {
                                console.error(err)
                            })


                    }).catch(err => {
                        console.error(err)
                    })

            }).catch(err => {
                console.error(err)
            })

        createEntity("/PURCHASE", 0, "Purchase")
            .then(purchaseEntity => {

                createGenre(purchaseEntity)
                    .then(purchaseGenre => {

                        createEntity(purchaseGenre.SYS_IDENTIFIER + "SUPPLIER", 1, "Supplier " + purchaseGenre.label)
                            .then(supplierEntity => {

                                createGenre(supplierEntity)
                                    .then(supplierGenre => {

                                        createEntity(supplierGenre.SYS_IDENTIFIER + "HANGZHOU", 2, "Company A")
                                        createEntity(supplierGenre.SYS_IDENTIFIER + "BEIJING", 2, "Company B")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                        createEntity(purchaseGenre.SYS_IDENTIFIER + "ORDER", 1, "Order " + purchaseGenre.label)
                            .then(orderEntity => {

                                createGenre(orderEntity)
                                    .then(orderGenre => {

                                        //createEntity(supplierGenre.SYS_IDENTIFIER + "HANGZHOU", 2, "Company A")
                                        //createEntity(supplierGenre.SYS_IDENTIFIER + "BEIJING", 2, "Company B")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })


                    }).catch(err => {
                        console.error(err)
                    })

            }).catch(err => {
                console.error(err)
            })

        createEntity("/MATERIAL", 0, "Material")
            .then(materialEntity => {

                createGenre(materialEntity)
                    .then(materialGenre => {

                        createEntity(materialGenre.SYS_IDENTIFIER + "KAPA_HIFI", 1, "Kapa " + materialGenre.label)
                            .then(kapaEntity => {

                                createGenre(kapaEntity)
                                    .then(kapaGenre => {

                                        createEntity(kapaGenre.SYS_IDENTIFIER + "LOT160806", 2, "LOT160806")
                                        createEntity(kapaGenre.SYS_IDENTIFIER + "LOT170312", 2, "LOT170312")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                        createEntity(materialGenre.SYS_IDENTIFIER + "EXONUCLEASE", 1, "Exonuclease " + materialGenre.label)
                            .then(kapaEntity => {

                                createGenre(kapaEntity)
                                    .then(kapaGenre => {

                                        createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                        createEntity(materialGenre.SYS_IDENTIFIER + "GLOVE", 1, "Glove " + materialGenre.label)
                            .then(kapaEntity => {

                                createGenre(kapaEntity)
                                    .then(kapaGenre => {

                                        //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                        createEntity(materialGenre.SYS_IDENTIFIER + "TIP", 1, "Tips " + materialGenre.label)
                            .then(kapaEntity => {

                                createGenre(kapaEntity)
                                    .then(kapaGenre => {

                                        //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                        createEntity(materialGenre.SYS_IDENTIFIER + "PRIMER", 1, "Primer " + materialGenre.label)
                            .then(kapaEntity => {

                                createGenre(kapaEntity)
                                    .then(kapaGenre => {

                                        //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

                                    }).catch(err => {
                                        console.error(err)
                                    })

                            }).catch(err => {
                                console.error(err)
                            })

                    }).catch(err => {
                        console.error(err)
                    })

            }).catch(err => {
                console.error(err)
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

        createEntity("/SALE", 0, "Sales")
            .then(saleEntity => {

                createGenre(saleEntity)
                    .then(saleGenre => {

                        createEntity(saleGenre.SYS_IDENTIFIER + "CLIENT", 1, "Client " + saleGenre.label)
                            .then(clientEntity => {

                                createGenre(clientEntity)
                                    .then(clientGenre => {

                                        createEntity(clientGenre.SYS_IDENTIFIER + "CLIENT_A", 2, "Client A")
                                        createEntity(clientGenre.SYS_IDENTIFIER + "CLIENT_B", 2, "Client B")

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        createEntity(saleGenre.SYS_IDENTIFIER + "CONTRACT", 1, "Contract " + saleGenre.label)
                            .then(clientEntity => {

                                createGenre(clientEntity)
                                    .then(clientGenre => {

                                        //createEntity(clientGenre.SYS_IDENTIFIER + "CLIENT_A", 2, "Client A")
                                        //createEntity(clientGenre.SYS_IDENTIFIER + "CLIENT_A", 2, "Client B")

                                    }).catch((err) => {
                                        console.log(err)
                                    })
                            }).catch((err) => {
                                console.log(err)
                            })

                        createEntity(saleGenre.SYS_IDENTIFIER + "BATCH", 1, "Batch " + saleGenre.label)
                            .then(clientEntity => {

                                createGenre(clientEntity)
                                    .then(clientGenre => {

                                        //createEntity(clientGenre.SYS_IDENTIFIER + "CLIENT_A", 2, "Client A")
                                        //createEntity(clientGenre.SYS_IDENTIFIER + "CLIENT_A", 2, "Client B")

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
