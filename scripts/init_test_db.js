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

function createWorkcenterAttribute(genre, label, code, type, order){
    let idElem = genre.SYS_IDENTIFIER.split("/")
    createAttribute({
        label: label,
        SYS_CODE: idElem[idElem.length - 2] + "_ATTR_" + code,
        SYS_TYPE: type,
        SYS_GENRE: genre.id,
        SYS_ORDER: order,
    })
}

function createAttribute(attribute){
    return Attribute(attribute)
        .save((err, attribute) =>{
            if (err) {
                console.log(err)
            }
        })
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

function createEntity(genre, identifier, typeIndex, label){
    return Entity({
        SYS_IDENTIFIER: genre.SYS_IDENTIFIER + identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[typeIndex],
        SYS_GENRE: genre,
        label: label.replace(" Genre","")
    })
        .save()
}

module.exports = function(){
    Genre.findOne({}, (err, found) => {
        if (found) {
            return
        }

        console.log(">>> Building test database...")

        let humanResourceClass = {}

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
                        }).save()

                        createEntity(genre, "HUMAN_RESOURCE", 0, "Human Resource")
                            .then(humanEntity => {

                                createGenre(humanEntity)
                                    .then(humanGenre => {

                                        createEntity(humanGenre, "IGENETECH", 1, "iGeneTech " + humanGenre.label)
                                            .then(igenetechEntity => {
                                                humanResourceClass = igenetechEntity

                                                createGenre(igenetechEntity)
                                                    .then(igenetechGenre => {
                                                        createEntity(igenetechGenre, "001", 2, "Neville")
                                                        createEntity(igenetechGenre, "002", 2, "Luna")
                                                        createEntity(igenetechGenre, "003", 2, "Gandalf")
                                                        createEntity(igenetechGenre, "004", 2, "Lummen")
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

                        createEntity(genre, "INSTRUMENT_RESOURCE", 0, "Instrument Resource")
                            .then(instrumentEntity => {

                                createGenre(instrumentEntity)
                                    .then(instrumentGenre => {

                                        createEntity(instrumentGenre, "SHEARING", 1, "Shearing " + instrumentGenre.label)
                                            .then(shearingEntity => {

                                                createGenre(shearingEntity)
                                                    .then(shearingGenre => {

                                                        createEntity(shearingGenre, "COVARIS_II", 3, "Covaris II")
                                                        createEntity(shearingGenre, "METARUPTOR_I", 3, "Metaruptor I")

                                                    }).catch(err => {
                                                        console.error(err)
                                                    })
                                            }).catch(err => {
                                                console.error(err)
                                            })



                                        createEntity(instrumentGenre, "GUN", 1, "Gun " + instrumentGenre.label)
                                            .then(gunEntity => {

                                                createGenre(gunEntity)
                                                    .then(gunGenre => {

                                                        createEntity(gunGenre, "BAI_DE", 3, "BD_1")
                                                        createEntity(gunGenre, "LIAN_HUA", 3, "LH_2")

                                                    }).catch(err => {
                                                        console.error(err)
                                                    })
                                            }).catch(err => {
                                                console.error(err)
                                            })


                                        createEntity(instrumentGenre, "SEQUENCING", 1, "Sequencing " + instrumentGenre.label)
                                            .then(seqEntity => {

                                                createGenre(seqEntity)
                                                    .then(seqGenre => {

                                                        createEntity(seqGenre, "X10", 3, "HiSeq X10")
                                                        createEntity(seqGenre, "NOVASEQ", 3, "NovaSeq")

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

                        createEntity(genre, "PURCHASE", 0, "Purchase")
                            .then(purchaseEntity => {

                                createGenre(purchaseEntity)
                                    .then(purchaseGenre => {

                                        createEntity(purchaseGenre, "SUPPLIER", 1, "Supplier " + purchaseGenre.label)
                                            .then(supplierEntity => {

                                                createGenre(supplierEntity)
                                                    .then(supplierGenre => {

                                                        createEntity(supplierGenre, "HANGZHOU", 2, "Company A")
                                                        createEntity(supplierGenre, "BEIJING", 2, "Company B")

                                                    }).catch(err => {
                                                        console.error(err)
                                                    })

                                            }).catch(err => {
                                                console.error(err)
                                            })

                                        createEntity(purchaseGenre, "ORDER", 1, "Order " + purchaseGenre.label)
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

                        createEntity(genre, "MATERIAL", 0, "Material")
                            .then(materialEntity => {

                                createGenre(materialEntity)
                                    .then(materialGenre => {

                                        createEntity(materialGenre, "KAPA_HIFI", 1, "Kapa " + materialGenre.label)
                                            .then(kapaEntity => {

                                                createGenre(kapaEntity)
                                                    .then(kapaGenre => {

                                                        createEntity(kapaGenre, "LOT160806", 2, "LOT160806")
                                                        createEntity(kapaGenre, "LOT170312", 2, "LOT170312")

                                                    }).catch(err => {
                                                        console.error(err)
                                                    })

                                            }).catch(err => {
                                                console.error(err)
                                            })

                                        createEntity(materialGenre, "EXONUCLEASE", 1, "Exonuclease " + materialGenre.label)
                                            .then(kapaEntity => {

                                                createGenre(kapaEntity)
                                                    .then(kapaGenre => {

                                                        createEntity(kapaGenre, "001", 2, "M0293S")

                                                    }).catch(err => {
                                                        console.error(err)
                                                    })

                                            }).catch(err => {
                                                console.error(err)
                                            })

                                        createEntity(materialGenre, "GLOVE", 1, "Glove " + materialGenre.label)
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

                                        createEntity(materialGenre, "TIP", 1, "Tips " + materialGenre.label)
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

                                        createEntity(materialGenre, "PRIMER", 1, "Primer " + materialGenre.label)
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
                        createEntity(genre, "BOM",0, "BoMs")
                            .then((domainEntity) => {
                                createGenre(domainEntity)
                                    .then((domainGenre) => {

                                        // SALE
                                        createEntity(domainGenre, "SALE", 1, "Sale " + domainGenre.label)
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
                                        createEntity(domainGenre, "MANUFACTURING", 1, "Manufacturing " + domainGenre.label)
                                            .then((classEntity) => {
                                                createGenre(classEntity)
                                                    .then((classGenre) => {

                                                        // LIBRARY
                                                        createEntity(classGenre, "LIBRARY_V1", 2, "Library V1 " + classGenre.label)
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
                                                        createEntity(classGenre, "EXTRACT_V1", 2, "Extract V1 " + classGenre.label)
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
                        createEntity(genre, "WORKCENTER",0, "WorkCenters")
                            .then((domainEntity) => {
                                createGenre(domainEntity)
                                    .then((domainGenre) => {

                                        // PRODUCT
                                        createEntity(domainGenre, "PRODUCT", 1, "Product " + domainGenre.label)
                                            .then((classEntity) => {
                                                createGenre(classEntity)
                                                    .then((classGenre) => {

                                                        // EXTRACT_ASSIGN
                                                        createEntity(classGenre, "SAMPLE_EXTRACT", 2, "Sample Extract " + classGenre.label)
                                                            .then((collectionEntity) => {
                                                                createGenre(collectionEntity)
                                                                    .then((collectionGenre) => {
                                                                        createAttribute({
                                                                            label: '提取人',
                                                                            SYS_CODE: 'SAMPLE_EXTRACT_ATTR_OPERATOR',
                                                                            SYS_ORDER: 100,
                                                                            SYS_TYPE: 'entity',
                                                                            SYS_TYPE_ENTITY: humanResourceClass.id,
                                                                            SYS_TYPE_ENTITY_REF: true,
                                                                            SYS_FLOOR_ENTITY_TYPE: 'collection',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                                    }).catch((err) => {
                                                                        console.log(err)
                                                                    })

                                                            }).catch((err) => {
                                                                console.log(err)
                                                            })

                                                        // EXTRACT_RESULT
                                                        createEntity(classGenre, "SAMPLE_QC", 2, "Sample QC " + classGenre.label)
                                                            .then((collectionEntity) => {
                                                                createGenre(collectionEntity)
                                                                    .then((collectionGenre) => {
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '样品体积',
                                                                            'VOLUME',
                                                                            'number',
                                                                            10)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '样品浓度',
                                                                            'CONC',
                                                                            'number',
                                                                            20)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '样品总量',
                                                                            'QUANTITY',
                                                                            'number',
                                                                            30)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            'OD 260/230',
                                                                            'OD230',
                                                                            'number',
                                                                            40)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            'OD 260/280',
                                                                            'OD280',
                                                                            'number',
                                                                            50)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '结果说明',
                                                                            'DESCRIPTION',
                                                                            'string',
                                                                            60)
                                                                        createAttribute({
                                                                            label: '检测结果',
                                                                            SYS_CODE: 'SAMPLE_QC_ATTR_RESULT',
                                                                            SYS_ORDER: 70,
                                                                            SYS_TYPE: 'list',
                                                                            SYS_TYPE_LIST: 'A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '检测备注',
                                                                            SYS_CODE: 'SAMPLE_QC_ATTR_REMARK',
                                                                            SYS_ORDER: 80,
                                                                            SYS_TYPE: 'list',
                                                                            SYS_TYPE_LIST: '1:合格,0:只电泳检测,-1:不合格',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '检测状态',
                                                                            SYS_CODE: 'SAMPLE_QC_ATTR_STATUS',
                                                                            SYS_ORDER: 90,
                                                                            SYS_TYPE: 'list',
                                                                            SYS_TYPE_LIST: '1:通过,-1:不通过',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '检测日期',
                                                                            SYS_CODE: 'SYS_DATE_COMPLETED',
                                                                            SYS_ORDER: 100,
                                                                            SYS_TYPE: 'date',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '检测员',
                                                                            SYS_CODE: 'SAMPLE_QC_ATTR_OPERATOR',
                                                                            SYS_ORDER: 110,
                                                                            SYS_TYPE: 'entity',
                                                                            SYS_TYPE_ENTITY_REF: true,
                                                                            SYS_TYPE_ENTITY: humanResourceClass.id,
                                                                            SYS_FLOOR_ENTITY_TYPE: 'collection',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        return collectionGenre
                                                                    })
                                                                    .then((collectionGenre) => {
                                                                        //console.log(collectionGenre)
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                                    }).catch((err) => {
                                                                        console.log(err)
                                                                    })

                                                            }).catch((err) => {
                                                                console.log(err)
                                                            })

                                                        // QC_RESULT
                                                        createEntity(classGenre, "SAMPLE_QC_REVIEW", 2, "Sample QC Review " + classGenre.label)
                                                            .then((collectionEntity) => {
                                                                createGenre(collectionEntity)
                                                                    .then((collectionGenre) => {
                                                                        createAttribute({
                                                                            label: '审核员',
                                                                            SYS_CODE: 'SAMPLE_QC_REVIEW_ATTR_OPERATOR',
                                                                            SYS_ORDER: 10,
                                                                            SYS_TYPE: 'entity',
                                                                            SYS_TYPE_ENTITY_REF: true,
                                                                            SYS_TYPE_ENTITY: humanResourceClass.id,
                                                                            SYS_FLOOR_ENTITY_TYPE: 'collection',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                                    }).catch((err) => {
                                                                        console.log(err)
                                                                    })

                                                            }).catch((err) => {
                                                                console.log(err)
                                                            })

                                                        // QC_REVIEW
                                                        createEntity(classGenre, "LIBRARY_PREPARE", 2, "Library Prepare " + classGenre.label)
                                                            .then((collectionEntity) => {
                                                                createGenre(collectionEntity)
                                                                    .then((collectionGenre) => {
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '文库名称',
                                                                            'LIBRARY_NAME',
                                                                            'string',
                                                                            10)
                                                                        createAttribute({
                                                                            label: '建库结果',
                                                                            SYS_CODE: 'LIBRARY_PREPARE_ATTR_RESULT',
                                                                            SYS_ORDER: 20,
                                                                            SYS_TYPE: 'list',
                                                                            SYS_TYPE_LIST: '1:合格,-1:不合格',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '建库开始时间',
                                                                            SYS_CODE: 'DATE_START',
                                                                            SYS_ORDER: 30,
                                                                            SYS_TYPE: 'date',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '建库结束时间',
                                                                            SYS_CODE: 'SYS_DATE_COMPLETED',
                                                                            SYS_ORDER: 40,
                                                                            SYS_TYPE: 'date',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createAttribute({
                                                                            label: '实验员',
                                                                            SYS_CODE: 'LIBRARY_PREPARE_ATTR_OPERATOR',
                                                                            SYS_ORDER: 50,
                                                                            SYS_TYPE: 'entity',
                                                                            SYS_TYPE_ENTITY_REF: true,
                                                                            SYS_TYPE_ENTITY: humanResourceClass.id,
                                                                            SYS_FLOOR_ENTITY_TYPE: 'collection',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            'Qubit浓度',
                                                                            'QUBIT_CONC',
                                                                            'number',
                                                                            60)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '文库体积',
                                                                            'LIBRARY_VOLUME',
                                                                            'number',
                                                                            70)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '文库切胶长度',
                                                                            'LIBRARY_GEL_LENGTH',
                                                                            'number',
                                                                            80)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '文库片段大小',
                                                                            'LIBRARY_FRAGMENT_SIZE',
                                                                            'number',
                                                                            90)
                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '文库体积',
                                                                            'LIBRARY_VOLUME',
                                                                            'number',
                                                                            100)
                                                                        createAttribute({
                                                                            label: '重建库原因',
                                                                            SYS_CODE: 'LIBRARY_PREPARE_ATTR_REBUILD_REASON',
                                                                            SYS_ORDER: 110,
                                                                            SYS_TYPE: 'list',
                                                                            SYS_TYPE_LIST: 'quality:样品质量差,risk:风险建库,operation:操作步骤不当,reagent:试剂原因,amount:总量不足,other:其他原因',
                                                                            SYS_GENRE: collectionGenre.id})

                                                                        createWorkcenterAttribute(
                                                                            collectionGenre,
                                                                            '结果说明',
                                                                            'DESCRIPTION',
                                                                            'text',
                                                                            120)
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                                    }).catch((err) => {
                                                                        console.log(err)
                                                                    })

                                                            }).catch((err) => {
                                                                console.log(err)
                                                            })

                                                        // Report
                                                        createEntity(classGenre, "LIBRARY_PREPARE_REVIEW", 2, "Library Prepare Review" + classGenre.label)
                                                            .then((collectionEntity) => {
                                                                createGenre(collectionEntity)
                                                                    .then((collectionGenre) => {
                                                                        createAttribute({
                                                                            label: '审核员',
                                                                            SYS_CODE: 'LIBRARY_PREPARE_ATTR_OPERATOR',
                                                                            SYS_ORDER: 10,
                                                                            SYS_TYPE: 'entity',
                                                                            SYS_TYPE_ENTITY_REF: true,
                                                                            SYS_TYPE_ENTITY: humanResourceClass.id,
                                                                            SYS_FLOOR_ENTITY_TYPE: 'collection',
                                                                            SYS_GENRE: collectionGenre.id})
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20170303", 3, "订单20170303")
                                                                        //createEntity(collectionGenre.SYS_IDENTIFIER + "20160708", 3, "订单20170708")
                                                                    }).catch((err) => {
                                                                        console.log(err)
                                                                    })

                                                            }).catch((err) => {
                                                                console.log(err)
                                                            })

                                                        createEntity(classGenre, "LIBRARY_CAPTURE", 2, "Library Capture" + classGenre.label)
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

                                                        createEntity(classGenre, "LIBRARY_CAPTURE_REVIEW", 2, "Library Capture Review" + classGenre.label)
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
                        createEntity(genre, "ROUTING",0, "Routings")
                            .then((domainEntity) => {
                                createGenre(domainEntity)
                                    .then((domainGenre) => {

                                        // PRODUCT
                                        createEntity(domainGenre, "PRODUCT", 1, "Product " + domainGenre.label)
                                            .then((classEntity) => {
                                                createGenre(classEntity)
                                                    .then((classGenre) => {

                                                        // PRODUCT ROUTING V1
                                                        createEntity(classGenre, "V1", 2, "V1 " + classGenre.label)
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

                        createEntity(genre, "SALE", 0, "Sales")
                            .then(saleEntity => {

                                createGenre(saleEntity)
                                    .then(saleGenre => {

                                        createEntity(saleGenre, "CLIENT", 1, "Client " + saleGenre.label)
                                            .then(clientEntity => {

                                                createGenre(clientEntity)
                                                    .then(clientGenre => {

                                                        createEntity(clientGenre, "CLIENT_A", 2, "Client A")
                                                        createEntity(clientGenre, "CLIENT_B", 2, "Client B")

                                                    }).catch((err) => {
                                                        console.log(err)
                                                    })
                                            }).catch((err) => {
                                                console.log(err)
                                            })

                                        createEntity(saleGenre, "CONTRACT", 1, "Contract " + saleGenre.label)
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

                                        createEntity(saleGenre, "BATCH", 1, "Batch " + saleGenre.label)
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
                        createEntity(genre, "SAMPLE",0, "Samples")
                            .then((domainEntity) => {
                                createGenre(domainEntity)
                                    .then((domainGenre) => {

                                        // DEFALUT
                                        createEntity(domainGenre, "DEFAULT", 1, "Default " + domainGenre.label)
                                            .then((classEntity) => {
                                                createGenre(classEntity)
                                                    .then((classGenre) => {

                                                        // DEFAULT
                                                        createEntity(classGenre, "DEFAULT", 2, "Default Collection " + classGenre.label)
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

                    }).catch((err) => {
                        console.error(err)
                    })
            })

        console.log(">>> Done!")
    })

}
