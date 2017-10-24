const Attribute = require('mongoose').model('Attribute')
const Genre = require('mongoose').model('Genre')
const Entity = require('mongoose').model('Entity')
const async = require('async')

const ENTITY_TYPE = {
    0: "domain",
    1: "class",
    2: "collection",
    3: "object",
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
        .catch(err => {
            console.log("createAttribute", err)
        })
}

function createGenre(entity){
    return Genre({
        SYS_IDENTIFIER: entity.SYS_IDENTIFIER + "/",
        SYS_ENTITY: entity.id,
        label: entity.label + " Genre",
    })
        .save()
        .catch(err => {
            console.log("createGenre", err)
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
        .catch(err => {
            console.log("createEntity", err)
        })
}

function createEntityWithOrder(genre, identifier, typeIndex, label, order){
    return Entity({
        SYS_IDENTIFIER: genre.SYS_IDENTIFIER + identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[typeIndex],
        SYS_GENRE: genre,
        SYS_ORDER: order,
        label: label.replace(" Genre","")
    })
        .save()
        .catch(err => {
            console.log("createEntityWithOrder", err)
        })
}

module.exports = async function(){

    let genreResult = await Genre.findOne(
        {},
        (err, found) => {
            return found
        }
    )

    if (genreResult) {
        console.log(">>> Omit database initialization")
        return
    }
    console.log(">>> Running database initialization")

    // Domain Entity{{{
    let domainEntity = await Entity({
        SYS_IDENTIFIER: "/",
        SYS_ENTITY_TYPE: "/",
        label: "Root",
    }).save()

    let domainGenre = await Genre({
        title: "Domain",
        SYS_IDENTIFIER: "/",
        SYS_LABEL: "title",
        SYS_ENTITY: domainEntity,
    }).save()

    await Attribute({
        label: '领域名称',
        SYS_CODE: 'label',
        SYS_TYPE: 'text',
        SYS_GENRE: domainGenre.id
    })
    //}}}

    // Human Resource Domain{{{
    let hrDomainEntity = await createEntity(domainGenre, "HUMAN_RESOURCE", 0, "Human Resource")
    let hrDomainGenre = await createGenre(hrDomainEntity)
    let hrClassEntity = await createEntity(hrDomainGenre, "IGENETECH", 1, "Staff")
    let hrClassGenre = await createGenre(hrClassEntity)
    createEntity(hrClassGenre, "001", 2, "Neville")
    createEntity(hrClassGenre, "002", 2, "Luna")
    createEntity(hrClassGenre, "003", 2, "Gandalf")
    createEntity(hrClassGenre, "004", 2, "Lummen")
    //}}}

    // Instrument Domain{{{
    let instrumentDomainEntity = await createEntity(domainGenre, "INSTRUMENT_RESOURCE", 0, "Instrument Resource")
    let instrumentDomainGenre = await createGenre(instrumentDomainEntity)
    let shearingClassEntity = await createEntity(instrumentDomainGenre, "SHEARING", 1, "Shearing " + instrumentDomainGenre.label)
    let shearingClassGenre = await createGenre(shearingClassEntity)
    createEntity(shearingClassGenre, "COVARIS_II", 3, "Covaris II")
    createEntity(shearingClassGenre, "METARUPTOR_I", 3, "Metaruptor I")

    let gunClassEntity = await createEntity(instrumentDomainGenre, "GUN", 1, "Gun " + instrumentDomainGenre.label)
    let gunClassGenre = await createGenre(gunClassEntity)
    createEntity(gunClassGenre, "BAI_DE", 3, "BD_1")
    createEntity(gunClassGenre, "LIAN_HUA", 3, "LH_2")

    let sequencingClassEntity = await createEntity(instrumentDomainGenre, "SEQUENCING", 1, "Sequencing " + instrumentDomainGenre.label)
    let sequencingClassGenre = await createGenre(sequencingClassEntity)
    createEntity(sequencingClassGenre, "X10", 3, "HiSeq X10")
    createEntity(sequencingClassGenre, "NOVASEQ", 3, "NovaSeq")
    //}}}

    // Purchase Domain{{{
    let purchaseDomainEntity = await createEntity(domainGenre, "PURCHASE", 0, "Purchase")
    let purchaseDomainGenre = await createGenre(purchaseDomainEntity)
    let supplierClassEntity = await createEntity(purchaseDomainGenre, "SUPPLIER", 1, "Supplier " + purchaseDomainGenre.label) 
    let supplierClassGenre = await createGenre(supplierClassEntity)
    createEntity(supplierClassGenre, "HANGZHOU", 2, "Company A")
    createEntity(supplierClassGenre, "BEIJING", 2, "Company B")

    let orderClassEntity = await createEntity(purchaseDomainGenre, "ORDER", 1, "Order " + purchaseDomainGenre.label)
    let orderClassGenre = await createGenre(orderClassEntity)
    //createEntity(supplierGenre.SYS_IDENTIFIER + "HANGZHOU", 2, "Company A")
    //createEntity(supplierGenre.SYS_IDENTIFIER + "BEIJING", 2, "Company B")
    //}}}

    // Material Domain{{{
    let materialDomainEntity = await createEntity(domainGenre, "MATERIAL", 0, "Material")
    let materialDomainGenre = await createGenre(materialDomainEntity)
    let kapaClassEntity = await createEntity(materialDomainGenre, "KAPA_HIFI", 1, "Kapa " + materialDomainGenre.label)
    let kapaClassGenre = await createGenre(kapaClassEntity)
    createEntity(kapaClassGenre, "LOT160806", 2, "LOT160806")
    createEntity(kapaClassGenre, "LOT170312", 2, "LOT170312")

    let exonClassEntity = await createEntity(materialDomainGenre, "EXONUCLEASE", 1, "Exonuclease " + materialDomainGenre.label)
    let exonClassGenre = await createGenre(exonClassEntity)
    createEntity(exonClassGenre, "001", 2, "M0293S")

    let gloveClassEntity = await createEntity(materialDomainGenre, "GLOVE", 1, "Glove " + materialDomainGenre.label)
    let gloveClassGenre = await createGenre(gloveClassEntity)
    createEntity(gloveClassGenre, "001", 2, "Rubber")

    let tipClassEntity = await createEntity(materialDomainGenre, "TIP", 1, "Tips " + materialDomainGenre.label)
    let tipClassGenre = await createGenre(tipClassEntity)
    //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

    let primerClassEntity = await createEntity(materialDomainGenre, "PRIMER", 1, "Primer " + materialDomainGenre.label)
    let primerClassGenre = await createGenre(primerClassEntity)
    //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")
    //}}}

    // BoM Domain{{{
    let bomDomainEntity = await createEntity(domainGenre, "BOM",0, "BoMs")
    let bomDomainGenre = await createGenre(bomDomainEntity)
    let saleClassEntity = await createEntity(bomDomainGenre, "SALE", 1, "Sale " + bomDomainGenre.label)
    let saleClassGenre = await createGenre(saleClassEntity)

    let manuClassEntity = await createEntity(bomDomainGenre, "MANUFACTURING", 1, "Manufacturing " + bomDomainGenre.label)
    let manuClassGenre = await createGenre(manuClassEntity)
    let extractCollEntity = await createEntity(manuClassGenre, "EXTRACT_V1", 2, "Extract V1 " + manuClassGenre.label)
    let extractCollGenre = await createGenre(extractCollEntity)
    createAttribute({
        // leave label blank as a leading checkbox
        label: '',
        // CHECKED is more clarity
        SYS_CODE: 'SYS_CHECKED',
        SYS_ORDER: 10,
        SYS_TYPE: 'boolean',
        SYS_GENRE: extractCollGenre.id})
    createAttribute({
        label: 'Material',
        SYS_CODE: 'SYS_SOURCE',
        SYS_ORDER: 20,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: materialDomainEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_GENRE: extractCollGenre.id})
    createAttribute({
        label: 'Quantity',
        SYS_CODE: 'SYS_QUANTITY',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: extractCollGenre.id})
    createAttribute({
        label: 'Remark',
        SYS_CODE: 'REMARK',
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: extractCollGenre.id})
    //}}}

    // Product Workcenter Domain{{{
    let prodWCDomainEntity = await createEntity(domainGenre, "PRODUCT_WORKCENTER", 0, "Product WorkCenters")
    let prodWCDomainGenre = await createGenre(prodWCDomainEntity)
    createAttribute({
        label: 'Order',
        SYS_CODE: 'SYS_ORDER',
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: prodWCDomainGenre.id
    })
    createAttribute({
        label: '工作中心名称',
        SYS_CODE: 'label',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: prodWCDomainGenre.id
    })
    createAttribute({
        label: 'Plugin: Panel Indicator',
        SYS_CODE: 'SYS_WORKCENTER_PLUGIN_PANEL_INDICATOR',
        SYS_ORDER: 30,
        SYS_TYPE: 'boolean',
        SYS_GENRE: prodWCDomainGenre.id
    })
    createAttribute({
        label: 'Plugin: Index Indicator',
        SYS_CODE: 'SYS_WORKCENTER_PLUGIN_INDEX_INDICATOR',
        SYS_ORDER: 40,
        SYS_TYPE: 'boolean',
        SYS_GENRE: prodWCDomainGenre.id
    })
    createAttribute({
        label: 'Plugin: Index Validator',
        SYS_CODE: 'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR',
        SYS_ORDER: 50,
        SYS_TYPE: 'boolean',
        SYS_GENRE: prodWCDomainGenre.id
    })
    createAttribute({
        label: 'Plugin: Excel Processor',
        SYS_CODE: 'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR',
        SYS_ORDER: 60,
        SYS_TYPE: 'boolean',
        SYS_GENRE: prodWCDomainGenre.id
    })
    createAttribute({
        label: 'Plugin: Auxiliary Attribute Manager',
        SYS_CODE: 'SYS_WORKCENTER_PLUGIN_ATTRIBUTE_INTRODUCER',
        SYS_ORDER: 70,
        SYS_TYPE: 'boolean',
        SYS_GENRE: prodWCDomainGenre.id
    })

    let sampleExtractClassEntity = await createEntityWithOrder(prodWCDomainGenre, "SAMPLE_EXTRACT", 1, "样品提取", 10)
    let sampleExtractClassGenre = await createGenre(sampleExtractClassEntity)
    await createAttribute({
        label: '提取人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 100,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: sampleExtractClassGenre.id})
    let sampleExtractResultClassEntity = await createEntityWithOrder(prodWCDomainGenre, "SAMPLE_QC_RESULT", 1, "样品提取结果", 20)
    let sampleExtractResultClassGenre = await createGenre(sampleExtractResultClassEntity)
    createWorkcenterAttribute(
        sampleExtractResultClassGenre,
        '样品体积',
        'VOLUME',
        'number',
        10)
    createWorkcenterAttribute(
        sampleExtractResultClassGenre,
        '样品浓度',
        'CONC',
        'number',
        20)
    createWorkcenterAttribute(
        sampleExtractResultClassGenre,
        '样品总量',
        'QUANTITY',
        'number',
        30)
    createWorkcenterAttribute(
        sampleExtractResultClassGenre,
        'OD 260/230',
        'OD230',
        'number',
        40)
    createWorkcenterAttribute(
        sampleExtractResultClassGenre,
        'OD 260/280',
        'OD280',
        'number',
        50)
    createWorkcenterAttribute(
        sampleExtractResultClassGenre,
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
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '检测备注',
        SYS_CODE: 'SAMPLE_QC_ATTR_REMARK',
        SYS_ORDER: 80,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,0:只电泳检测,-1:不合格',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '检测状态',
        SYS_CODE: 'SAMPLE_QC_ATTR_STATUS',
        SYS_ORDER: 90,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:通过,-1:不通过',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '检测日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 100,
        SYS_TYPE: 'date',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '检测员',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 110,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: sampleExtractResultClassGenre.id})

    let sampleQCReviewClassEntity = await createEntityWithOrder(prodWCDomainGenre, "SAMPLE_QC_REVIEW", 1, "样品质检", 30)
    let sampleQCReviewClassGenre = await createGenre(sampleQCReviewClassEntity)
    await createAttribute({
        label: '审核员',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 10,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: sampleQCReviewClassGenre.id})
    let libraryPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "LIBRARY_RESULT", 1, "文库制备", 40)
    let libraryPrepareClassGenre = await createGenre(libraryPrepareClassEntity)
    createAttribute({
        label: '文库名称',
        SYS_CODE: 'LIBRARY_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '建库开始时间',
        SYS_CODE: 'LIBRARY_PREPARE_START_DATE',
        SYS_ORDER: 20,
        SYS_TYPE: 'date',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '建库结束时间',
        SYS_CODE: 'LIBRARY_PREPARE_END_DATE',
        SYS_ORDER: 30,
        SYS_TYPE: 'date',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '样品使用量',
        SYS_CODE: 'SAMPLE_USAGE',
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '文库切胶长度',
        SYS_CODE: 'LIBRARY_GEL_SIZE',
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '文库片段大小',
        SYS_CODE: 'LIBRARY_FRAGMENT_SIZE',
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '是否重建库',
        SYS_CODE: 'IS_REPEATED',
        SYS_ORDER: 70,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:是,-1:否',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '建库结果',
        SYS_CODE: 'LIBRARY_QUALIFIED',
        SYS_ORDER: 80,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,-1:不合格',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: 'Qubit浓度',
        SYS_CODE: 'QUBIT_CONC',
        SYS_ORDER: 90,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '文库体积',
        SYS_CODE: 'LIBRARY_VOLUME',
        SYS_ORDER: 100,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '实验员',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 110,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '重建库原因',
        SYS_CODE: 'LANE_REPEAT_REASON',
        SYS_ORDER: 120,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'sample:样品质量差,risk:风险建库,operation:操作步骤不当,reagent:试剂原因,amount:总量不足,other:其他原因',
        SYS_GENRE: libraryPrepareClassGenre.id})

    let libraryReviewClassEntity = await createEntityWithOrder(prodWCDomainGenre, "LIBRARY_REVIEW", 1, "文库制备结果审核", 50)
    let libraryReviewClassGenre = await createGenre(libraryReviewClassEntity)
    await createAttribute({
        label: '审核员',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 10,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryReviewClassGenre.id})
    let capturePrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "CAPTURE_PREPARE", 1, "文库捕获", 60)
    let capturePrepareClassGenre = await createGenre(capturePrepareClassEntity)
    createAttribute({
        label: '捕获编号',
        SYS_CODE: 'SYS_CAPTURE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '捕获日期',
        SYS_CODE: 'CAPTURE_DATE',
        SYS_ORDER: 20,
        SYS_TYPE: 'date',
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '杂交数',
        SYS_CODE: 'HYBRID_COUNT',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})

    let captureResultClassEntity = await createEntityWithOrder(prodWCDomainGenre, "CAPTURE_RESULT", 1, "文库捕获结果", 70)
    let captureResultClassGenre = await createGenre(captureResultClassEntity)
    createAttribute({
        label: '捕获后文库浓度',
        SYS_CODE: 'CAPTURE_CONC',
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: captureResultClassGenre.id})
    createAttribute({
        label: '片段大小',
        SYS_CODE: 'CAPTURE_FRAGMENT_SIZE',
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: captureResultClassGenre.id})

    let lanePrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "LANE_PREPARE", 1, "Pooling", 80)
    let lanePrepareClassGenre = await createGenre(lanePrepareClassEntity)
    createAttribute({
        label: '混合文库编号',
        SYS_CODE: 'SYS_LANE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: 'Pooling日期',
        SYS_CODE: 'POOLING_DATE',
        SYS_ORDER: 20,
        SYS_TYPE: 'date',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '混合实际浓度',
        SYS_CODE: 'HYBRID_CONC_PRACTICAL',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '混合理论浓度',
        SYS_CODE: 'HYBRID_CONC_THEORETICAL',
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '混合平均片段长度',
        SYS_CODE: 'HYBRID_FRAGMENT_AVERAGE_SIZE',
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '混合后体积',
        SYS_CODE: 'HYBRID_VOLUME',
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '测序类型',
        SYS_CODE: 'SEQUENCE_TYPE',
        SYS_ORDER: 70,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'pe:PE测序,se:SE测序',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '实验员',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 80,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '重做原因',
        SYS_CODE: 'LANE_REPEAT_REASON',
        SYS_ORDER: 90,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'device:仪器故障,operation:操作步骤不当,reagent:试剂原因,server:服务器原因,other:其他原因',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '是否外送',
        SYS_CODE: 'IS_OUTBOUND',
        SYS_ORDER: 100,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:是,-1:否',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '预计下机日期',
        SYS_CODE: 'EXPECTED_COMPLETED_DATE',
        SYS_ORDER: 110,
        SYS_TYPE: 'date',
        SYS_GENRE: lanePrepareClassGenre.id})
    let runPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "RUN_PREPARE", 1, "上机测序", 90)
    let runPrepareClassGenre = await createGenre(runPrepareClassEntity)
    createAttribute({
        label: '方案名称',
        SYS_CODE: 'SYS_RUN_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: runPrepareClassGenre.id})
    createAttribute({
        label: '机器类型',
        SYS_CODE: 'RUN_INSTRUMENT',
        SYS_ORDER: 20,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'hiseq:HiSeq,miseq:MiSeq,novaseq:NovaSeq',
        SYS_GENRE: runPrepareClassGenre.id})
    createAttribute({
        label: '重做原因',
        SYS_CODE: 'REPEAT_REASON',
        SYS_ORDER: 30,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'device:仪器故障,operation:操作步骤不当,reagent:试剂原因,server:服务器原因,other:其他原因',
        SYS_GENRE: runPrepareClassGenre.id})
    createAttribute({
        label: '机器编号',
        SYS_CODE: 'INSTURMENT_CODE',
        SYS_ORDER: 40,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'alane:A,blane:B',
        SYS_GENRE: runPrepareClassGenre.id})
    createAttribute({
        label: '测序类型',
        SYS_CODE: 'SEQUENCE_TYPE',
        SYS_ORDER: 50,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'pe:PE测序,se:SE测序',
        SYS_GENRE: runPrepareClassGenre.id})
    createAttribute({
        label: '备注',
        SYS_CODE: 'SEQUENCE_REMARK',
        SYS_ORDER: 60,
        SYS_TYPE: 'text',
        SYS_GENRE: runPrepareClassGenre.id})

    let runResultClassEntity = await createEntityWithOrder(prodWCDomainGenre, "RUN_RESULT", 1, "测序结果", 100)
    let runResultClassGenre = await createGenre(runResultClassEntity)
    createAttribute({
        label: '下机数据路径',
        SYS_CODE: 'RUN_DATA_PATH',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: runResultClassGenre.id})
    createAttribute({
        label: '仪器状态',
        SYS_CODE: 'RUN_INSTRUMENT_STATUS',
        SYS_ORDER: 20,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:正常,-1:异常',
        SYS_GENRE: runResultClassGenre.id})
    createAttribute({
        label: '确认下机时间',
        SYS_CODE: 'RUN_COMPLETED_DATE',
        SYS_ORDER: 30,
        SYS_TYPE: 'date',
        SYS_GENRE: runResultClassGenre.id})
    createAttribute({
        label: '仪器备注',
        SYS_CODE: 'RUN_INSTRUMENT_REMARK',
        SYS_ORDER: 40,
        SYS_TYPE: 'text',
        SYS_GENRE: runResultClassGenre.id})
    //}}}

    // Project Workcenter Domain{{{
    let projectWCDomainEntity = await createEntity(domainGenre, "PROJECT_MANAGEMENT", 0, "Project Management Workcenters")
    let projectWCDomainGenre = await createGenre(projectWCDomainEntity)
    let generalProjectClassEntity = await createEntity(projectWCDomainGenre, "GENERAL_PROJECT", 1, "General Project")
    let generalProjectClassGenre = await createGenre(generalProjectClassEntity)
    createAttribute({
        label: '样品编号',
        // SYS prefix to indicate importance
        // to get the all the workcenters in
        // plan for the specific sample
        SYS_CODE: 'SYS_SAMPLE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_IS_ENTITY_LABEL: true,
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '样品名称',
        SYS_CODE: 'SAMPLE_NAME',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '计划进度',
        SYS_CODE: 'SYS_DATE_SCHEDULED',
        SYS_ORDER: 30,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: 'Panel编号',
        SYS_CODE: 'SYS_PANEL_CODE',
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '数据量',
        SYS_CODE: 'SYS_DATA_SIZE',
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '测序深度',
        SYS_CODE: 'SEQUENCING_DEPTH',
        SYS_ORDER: 60,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: 'Index编号',
        SYS_CODE: 'SYS_INDEX_CODE',
        SYS_ORDER: 70,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: 'Index序列',
        SYS_CODE: 'SYS_INDEX_SEQUENCE',
        SYS_ORDER: 80,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    //}}}

    // Routing Domain{{{
    let routingDomainEntity = await createEntity(domainGenre, "ROUTING",0, "Routings")
    let routingDomainGenre = await createGenre(routingDomainEntity)
    let productRoutingClassEntity = await createEntity(routingDomainGenre, "PRODUCT_ROUTING", 1, "Product " + routingDomainGenre.label)
    let productRoutingClassGenre = await createGenre(productRoutingClassEntity)
    createAttribute({
        label: 'Routing Title',
        SYS_CODE: 'PRODUCT_ROUTING_ATTR_TITLE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_IS_ENTITY_LABEL: true,
        SYS_GENRE: productRoutingClassEntity.id})

    let v1CollEntity = await Entity({
        SYS_IDENTIFIER: productRoutingClassGenre.SYS_IDENTIFIER + 'ROUTING_V1',
        SYS_ENTITY_TYPE: 'collection',
        PRODUCT_ROUTING_ATTR_TITLE: 'Routing V1',
        SYS_LABEL: 'PRODUCT_ROUTING_ATTR_TITLE',
        SYS_GENRE: productRoutingClassGenre.id,
        label: 'Routing V1' // compatable with the createEntity
    }).save()

    // add routing v1 to the general project
    createAttribute({
        label: 'Routing',
        SYS_CODE: 'ROUTING',
        SYS_ORDER: 100,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: v1CollEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_GENRE:generalProjectClassGenre.id
    })

    let v1CollGenre = await createGenre(v1CollEntity)
    await createAttribute({
        // leave label blank as a leading checkbox
        label: '',
        // CHECKED is more clarity
        SYS_CODE: 'SYS_CHECKED',
        SYS_ORDER: 10,
        SYS_TYPE: 'boolean',
        SYS_GENRE: v1CollGenre.id})
    await createAttribute({
        label: 'Order',
        SYS_CODE: 'SYS_ORDER',
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: v1CollGenre.id})
    await createAttribute({
        label: 'Routing',
        SYS_CODE: 'SYS_SOURCE',
        SYS_ORDER: 30,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: productRoutingClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_GENRE: v1CollGenre.id})
    await createAttribute({
        label: 'Duration',
        SYS_CODE: 'SYS_DURATION',
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: v1CollGenre.id})

    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'EXTRACTION_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 10,
        SYS_SOURCE: sampleExtractClassEntity.id,
        SYS_DURATION: 3,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'EXTRACTION_RESULT',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 20,
        SYS_SOURCE: sampleExtractResultClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'SAMPLE_QC',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 30,
        SYS_SOURCE: sampleQCReviewClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'LIBRARY_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 40,
        SYS_SOURCE: libraryPrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'LIBRARY_REVIEW',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 50,
        SYS_SOURCE: libraryReviewClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'CAPTURE_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 60,
        SYS_SOURCE: capturePrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'CAPTURE_RESULT',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 70,
        SYS_SOURCE: captureResultClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'POOLING',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 80,
        SYS_SOURCE: lanePrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'SEQUENCE_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: false,
        SYS_ORDER: 90,
        SYS_SOURCE: runPrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'SEQUENCE_RESULT',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: false,
        SYS_ORDER: 100,
        SYS_SOURCE: runResultClassEntity.id,
        SYS_DURATION: 10,
    }).save()
    //}}}

    // Sale Domain{{{
    let saleDomainEntity = await createEntity(domainGenre, "SALE", 0, "Sales")
    let saleDomainGenre = await createGenre(saleDomainEntity)
    let clientClassEntity = await createEntity(saleDomainGenre, "CLIENT", 1, "Client " + saleDomainGenre.label)
    let clientClassGenre = await createGenre(clientClassEntity)
    createEntity(clientClassGenre, "CLIENT_A", 2, "Client A")
    createEntity(clientClassGenre, "CLIENT_B", 2, "Client B")

    let contractClassEntity = await createEntity(saleDomainGenre, "CONTRACT", 1, "Contract " + saleDomainGenre.label)
    let contractClassGenre = await createGenre(contractClassEntity)
    let batchClassEntity = await createEntity(saleDomainGenre, "BATCH", 1, "Batch " + saleDomainGenre.label)
    let batchClassGenre = await createGenre(batchClassEntity)
    //}}}

    // Sample Domain{{{
    let sampleDomainEntity = await createEntity(domainGenre, "SAMPLE",0, "Samples")
    let sampleDomainGenre = await createGenre(sampleDomainEntity)
    let defaultSampleClassEntity = await createEntity(sampleDomainGenre, "DEFAULT", 1, "Default " + sampleDomainGenre.label)
    let defaultSampleClassGenre = await createGenre(defaultSampleClassEntity)
    let defaultSampleCollEntity = await createEntity(defaultSampleClassGenre, "DEFAULT", 2, "Default Collection " + defaultSampleClassGenre.label)
    let defaultSampleCollGenre = await createGenre(defaultSampleCollEntity)
    //}}}

    console.log(">>> done!")

}
