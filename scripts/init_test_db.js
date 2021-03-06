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

const WC_ID_GENERAL_PROJECT = 'GENERAL_PROJECT'
const WC_ID_EXTRACT = 'DNA_EXTRACTION'
const WC_ID_APPROVE = 'PROJECT_APPROVE'
const WC_ID_SHEAR = 'SHEAR'
const WC_ID_LIBRARY_PREPARE = 'LIBRARY_PREPARE'
const WC_ID_CAPTURE = 'CAPTURE_PREPARE'
const WC_ID_MULTIPLEX_LIBRARY_PREPARE = 'MULTIPLEX_LIBRARY_PREPRAE'
const WC_ID_POOLING = 'POOLING'
const WC_ID_SEQUENCE_DATA = 'SEQUENCE_DATA'

function getAttributeIdentifier(workcenterIdentifier, attributeString){
    return 'CONF_' + workcenterIdentifier + '_' + attributeString
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
        .save()
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

function createGenreWithAttributes(entity, attributes){
    let genre = Genre({
        SYS_IDENTIFIER: entity.SYS_IDENTIFIER + "/",
        SYS_ENTITY: entity.id,
        label: entity.label + " Genre",
    })
    Object.keys(attributes).forEach(attr => {
        genre.set(attr, attributes[attr])
    })
    return genre
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
        SYS_LABEL: "label",
        label: label.replace(" Genre","")
    })
        .save()
        .catch(err => {
            console.log("createEntity", err)
        })
}

function createMaterialEntity(genre, identifier, label, unit){
    return Entity({
        SYS_IDENTIFIER: genre.SYS_IDENTIFIER + identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[1],
        SYS_GENRE: genre,
        SYS_LABEL: "label",
        label: label,
        SYS_OUTBOUND_UNIT: unit,
    })
        .save()
        .catch(err => {
            console.log("createEntity", err)
        })
}

function createIndexEntity(genre, identifier, code, sequence){
    return Entity({
        SYS_IDENTIFIER: genre.SYS_IDENTIFIER + identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[2],
        SYS_GENRE: genre,
        SYS_LABEL: "SYS_INDEX_CODE",
        SYS_INDEX_CODE: code,
        SYS_INDEX_SEQUENCE: sequence,
    })
        .save()
        .catch(err => {
            console.log("createEntity", err)
        })
}

function createBomAttributes(bomGenre, materialDomainEntity){
    createAttribute({
        // leave label blank as a leading checkbox
        label: '',
        SYS_CODE: 'SYS_CHECKED',
        SYS_ORDER: 10,
        SYS_TYPE: 'boolean',
        SYS_GENRE: bomGenre.id})
    createAttribute({
        label: 'Material',
        SYS_CODE: 'SYS_SOURCE',
        SYS_ORDER: 20,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: materialDomainEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_GENRE: bomGenre.id})
    createAttribute({
        label: 'Quantity',
        SYS_CODE: 'SYS_QUANTITY',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: bomGenre.id})
    createAttribute({
        label: 'Remark',
        SYS_CODE: 'REMARK',
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: bomGenre.id})
}

function createBomSubEntity(bomGenre, materialObjectList){
    let order = 1
    for (let materialObject of materialObjectList){
        let material = materialObject['material']
        let materialIdentifier = material['SYS_IDENTIFIER']
        let quantity = materialObject['quantity']
        Entity({
            SYS_IDENTIFIER: bomGenre['SYS_IDENTIFIER'] + materialIdentifier.substring(materialIdentifier.lastIndexOf("/") + 1),
            SYS_ENTITY_TYPE: 'object',
            SYS_GENRE: bomGenre.id,
            SYS_CHECKED: true,
            SYS_LABEL: 'label',
            label: "MATERIAL: " + material[material['SYS_LABEL']],
            REMARK: '',
            SYS_SOURCE: material.id,
            SYS_QUANTITY: quantity,
            SYS_ORDER: order * 10,
        }).save()
        order += 1
    }
}

function createRoutingAttributes(routingCollectionGenre, routingClassEntity){
    createAttribute({
        // leave label blank as a leading checkbox
        label: '',
        SYS_CODE: 'SYS_CHECKED',
        SYS_ORDER: 10,
        SYS_TYPE: 'boolean',
        SYS_GENRE: routingCollectionGenre.id})
    createAttribute({
        label: 'Order',
        SYS_CODE: 'SYS_ORDER',
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: routingCollectionGenre.id})
    createAttribute({
        label: 'Routing',
        SYS_CODE: 'SYS_SOURCE',
        SYS_ORDER: 30,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: routingClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_GENRE: routingCollectionGenre.id})
    createAttribute({
        label: 'Duration',
        SYS_CODE: 'SYS_DURATION',
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: routingCollectionGenre.id})
}

function createRoutingSubEntity(routingCollectionGenre, workcenterObjectList){

    let order = 1
    for (let workcenterObject of workcenterObjectList){
        let workcenter = workcenterObject['workcenter']
        let workcenterIdentifier = workcenter['SYS_IDENTIFIER']
        let duration = workcenterObject['duration']
        let checked = workcenterObject['checked']
        Entity({
            SYS_IDENTIFIER: routingCollectionGenre['SYS_IDENTIFIER'] + workcenterIdentifier.substring(workcenterIdentifier.lastIndexOf("/") + 1),
            SYS_ENTITY_TYPE: 'object',
            SYS_GENRE: routingCollectionGenre.id,
            SYS_CHECKED: checked,
            SYS_ORDER: order * 10,
            SYS_SOURCE: workcenter.id,
            SYS_DURATION: duration,
        }).save()
        order += 1
    }
}

function createEntityWithAttributes(genre, identifier, typeIndex, attributes){
    let entity = Entity({
        SYS_IDENTIFIER: genre.SYS_IDENTIFIER + identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[typeIndex],
        SYS_GENRE: genre,
    })
    Object.keys(attributes).forEach(attr => {
        entity.set(attr, attributes[attr])
    })
    //let entity = Entity.hydrate(entityObj)
    //console.log("---", entityDoc)

    return entity
        .save()
        .catch(err => {
            console.log("createEntity", err)
        })
}

function createEntityWithOrder(genre, identifier, typeIndex, label, order, entityObject){
    let entity = {
        SYS_IDENTIFIER: genre.SYS_IDENTIFIER + identifier,
        SYS_ENTITY_TYPE: ENTITY_TYPE[typeIndex],
        SYS_GENRE: genre,
        SYS_ORDER: order,
        label: label.replace(" Genre","")
    }
    if (entityObject) {
        Object.keys(entityObject).forEach(key => {
            entity[key] = entityObject[key]
        })
    }
    return Entity(entity)
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
        label: '????????????',
        SYS_CODE: 'label',
        SYS_TYPE: 'text',
        SYS_GENRE: domainGenre.id
    })
    //}}}

    // Human Resource Domain{{{
    let hrDomainEntity = await createEntity(domainGenre, "HUMAN_RESOURCE", 0, "Human Resource")
    let hrDomainGenre = await createGenre(hrDomainEntity)
    let hrClassEntity = await createEntity(hrDomainGenre, "IGENETECH", 1, "Staff")
    //let hrClassGenre = await createGenre(hrClassEntity)
    let hrClassGenre = await createGenreWithAttributes(hrClassEntity, {'SYS_LABEL': 'SYS_USER_NAME'})
    createAttribute({
        label: 'Email',
        SYS_CODE: 'SYS_USER_EMAIL',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: hrClassGenre.id})
    createAttribute({
        label: 'Name',
        SYS_CODE: 'SYS_USER_NAME',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: hrClassGenre.id})
    createEntityWithAttributes(hrClassGenre, "001", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "????????????", "SYS_USER_EMAIL":"jingwei.guan@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "002", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "???????????????", "SYS_USER_EMAIL":"quwubin@gmail.com"})
    createEntityWithAttributes(hrClassGenre, "003", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "??????????????????", "SYS_USER_EMAIL":"xiaoxiao.zhang@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "004", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "?????????", "SYS_USER_EMAIL":"qianzhi.shao@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "005", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "??????", "SYS_USER_EMAIL":"yang.wu@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "006", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "?????????", "SYS_USER_EMAIL":"jianming.yi@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "007", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "?????????", "SYS_USER_EMAIL":"fengdan.zhang@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "008", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "?????????", "SYS_USER_EMAIL":"liping.ren@igenetech.com"})
    //}}}

    // Instrument Domain{{{
    let instrumentDomainEntity = await createEntity(domainGenre, "INSTRUMENT_RESOURCE", 0, "Instrument Resource")
    let instrumentDomainGenre = await createGenre(instrumentDomainEntity)
    let shearingClassEntity = await createEntity(instrumentDomainGenre, "SHEARING", 1, "Shearing " + instrumentDomainGenre.label)
    let shearingClassGenre = await createGenre(shearingClassEntity)
    createEntity(shearingClassGenre, "COVARIS_II", 2, "Covaris II")
    createEntity(shearingClassGenre, "METARUPTOR_I", 2, "Metaruptor I")

    let gunClassEntity = await createEntity(instrumentDomainGenre, "GUN", 1, "Gun " + instrumentDomainGenre.label)
    let gunClassGenre = await createGenre(gunClassEntity)
    createEntity(gunClassGenre, "BAI_DE", 2, "BD_1")
    createEntity(gunClassGenre, "LIAN_HUA", 2, "LH_2")

    let sequencingClassEntity = await createEntity(instrumentDomainGenre, "SEQUENCING", 1, "Sequencing " + instrumentDomainGenre.label)
    let sequencingClassGenre = await createGenre(sequencingClassEntity)
    createEntity(sequencingClassGenre, "X10", 2, "HiSeq X10")
    createEntity(sequencingClassGenre, "NOVASEQ", 2, "NovaSeq")
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
    createEntity(tipClassGenre, "Tip_1", 2, "Tip#1")
    //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

    let primerClassEntity = await createEntity(materialDomainGenre, "PRIMER", 1, "Primer " + materialDomainGenre.label)
    let primerClassGenre = await createGenre(primerClassEntity)
    //createEntity(kapaGenre.SYS_IDENTIFIER + "001", 2, "M0293S")

    let tpeClassEntity = await createEntity(materialDomainGenre, "TPE", 1, "Index TPE")
    let tpeClassGenre = await createGenre(tpeClassEntity)
    createAttribute({
        label: 'Index ??????',
        SYS_LABEL: 'label',
        SYS_CODE: 'SYS_INDEX_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: tpeClassGenre.id})
    createAttribute({
        // leave label blank as a leading checkbox
        label: 'Index ??????',
        SYS_LABEL: 'label',
        SYS_CODE: 'SYS_INDEX_SEQUENCE',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: tpeClassGenre.id})
    createIndexEntity(tpeClassGenre, "TPE_1", "1", "AAAACCCC")
    createIndexEntity(tpeClassGenre, "TPE_2", "2", "TTTTGGGG")
    createIndexEntity(tpeClassGenre, "TPE_3", "3", "CCCCAAAA")
    createIndexEntity(tpeClassGenre, "TPE_4", "4", "GGGGTTTT")

    let igtClassEntity = await createEntity(materialDomainGenre, "IGT", 1, "Index IGT")
    let igtClassGenre = await createGenre(igtClassEntity)
    createAttribute({
        label: 'Index ??????',
        SYS_LABEL: 'label',
        SYS_CODE: 'SYS_INDEX_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: igtClassGenre.id})
    createAttribute({
        // leave label blank as a leading checkbox
        label: 'Index ??????',
        SYS_LABEL: 'label',
        SYS_CODE: 'SYS_INDEX_SEQUENCE',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: igtClassGenre.id})
    createIndexEntity(igtClassGenre, "IGT_1", "1", "AAAATTTT")
    createIndexEntity(igtClassGenre, "IGT_2", "2", "TTTTAAAA")
    createIndexEntity(igtClassGenre, "IGT_3", "3", "CCCCGGGG")
    createIndexEntity(igtClassGenre, "IGT_4", "4", "GGGGCCCC")

    // Extract{{{
    let materialBloodExtractKitClassEntity = await createMaterialEntity(materialDomainGenre, "BLOOD_DNA_EXTRACT_KIT", "???????????????DNA???????????????", "T")
    let materialBloodExtractKitClassGenre = await createGenre(materialBloodExtractKitClassEntity)
    createEntity(materialBloodExtractKitClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialOrganBloodExtractKitClassEntity = await createMaterialEntity(materialDomainGenre, "ORGAN_BLOOD_DNA_EXTRACT_KIT", "????????????????????????DNA???????????????", "T")
    let materialOrganBloodExtractKitClassGenre = await createGenre(materialOrganBloodExtractKitClassEntity)
    createEntity(materialOrganBloodExtractKitClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialBlackPrepExtractKitClassEntity = await createMaterialEntity(materialDomainGenre, "BLACKPREP_FFPE_DNA_EXTRACT_KIT", "BlackPREP FFPE DNA Kit", "T")
    let materialBlackPrepExtractKitClassGenre = await createGenre(materialBlackPrepExtractKitClassEntity)
    createEntity(materialBlackPrepExtractKitClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialFaecesExtractKitClassEntity = await createMaterialEntity(materialDomainGenre, "FAECES_DNA_EXTRACT_KIT", "???????????????DNA???????????????", "T")
    let materialFaecesExtractKitClassGenre = await createGenre(materialFaecesExtractKitClassEntity)
    createEntity(materialFaecesExtractKitClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialCirculatingExtractKitClassEntity = await createMaterialEntity(materialDomainGenre, "CIRCULATING_DNA_EXTRACT_KIT", "Circulating DNA Kit", "T")
    let materialCirculatingExtractKitClassGenre = await createGenre(materialCirculatingExtractKitClassEntity)
    createEntity(materialCirculatingExtractKitClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialHSBRQuantifyKitClassEntity = await createMaterialEntity(materialDomainGenre, "HS_BR_QUANTIFY_KIT", "HS/BR??????", "T")
    let materialHSBRQuantifyKitClassGenre = await createGenre(materialHSBRQuantifyKitClassEntity)
    createEntity(materialHSBRQuantifyKitClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialAgaroseClassEntity = await createMaterialEntity(materialDomainGenre, "AGAROSE", "?????????", "g")
    let materialAgaroseClassGenre = await createGenre(materialAgaroseClassEntity)
    createEntity(materialAgaroseClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialSixLoadingBufferClassEntity = await createMaterialEntity(materialDomainGenre, "SIX_DNA_LOADING_BUFFER", "6*DNA Loading Buffer", "??L")
    let materialSixLoadingBufferClassGenre = await createGenre(materialSixLoadingBufferClassEntity)
    createEntity(materialSixLoadingBufferClassGenre, "DEFAULT_LOT", 2, "Default LOT")

    let materialLambdaDNAClassEntity = await createMaterialEntity(materialDomainGenre, "LAMBDA_DNA", "??DNA|HindIII", "??L")
    let materialLambdaDNAClassGenre = await createGenre(materialLambdaDNAClassEntity)
    createEntity(materialLambdaDNAClassGenre, "DEFAULT_LOT", 2, "Default LOT")//}}}

    // MultiPCR{{{
    let IGTPolymeraseEntity = await createMaterialEntity(materialDomainGenre, "IGT_POLYMERASE_MIXTURE", "IGT polymerase mixture", "??L")
    let IGTPolymeraseGenre = await createGenre(IGTPolymeraseEntity)
    createEntity(IGTPolymeraseGenre, "DEFAULT_LOT", 2, "Default LOT")

    let primerEntity = await createMaterialEntity(materialDomainGenre, "PRIMER_MIXTURE", "primer mixture", "??L")
    let primerGenre = await createGenre(primerEntity)
    createEntity(primerGenre, "DEFAULT_LOT", 2, "Default LOT")

    let enhancerBufferEntity = await createMaterialEntity(materialDomainGenre, "ENHANCER_BUFFER_NB_", "Enhancer buffer NB(1N)", "??L")
    let enhancerBufferGenre = await createGenre(enhancerBufferEntity)
    createEntity(enhancerBufferGenre, "DEFAULT_LOT", 2, "Default LOT")

    let yfBufferEntity = await createMaterialEntity(materialDomainGenre, "YF_BUFFER_B", "YF buffer B", "??L")
    let yfBufferGenre = await createGenre(yfBufferEntity)
    createEntity(yfBufferGenre, "DEFAULT_LOT", 2, "Default LOT")

    let igtI5Entity = await createMaterialEntity(materialDomainGenre, "IGT_I5_INDEX", "IGT-I5 Index(10??M)", "??L")
    let igtI5Genre = await createGenre(igtI5Entity)
    createEntity(igtI5Genre, "DEFAULT_LOT", 2, "Default LOT")

    let igtI7Entity = await createMaterialEntity(materialDomainGenre, "IGT_I7_INDEX", "IGT-I7 Index(10??M)", "??L")
    let igtI7Genre = await createGenre(igtI7Entity)
    createEntity(igtI7Genre, "DEFAULT_LOT", 2, "Default LOT")//}}}

    // Library preparing{{{
    let fastKitEntity = await createMaterialEntity(materialDomainGenre, "FAST_LIBRARY_PREPARATION_KIT", "FAST???????????????", "??L")
    let fastKitGenre = await createGenre(fastKitEntity)
    createEntity(fastKitGenre, "DEFAULT_LOT", 2, "Default LOT")//}}}

    // Capture{{{
    let ranseEntity = await createMaterialEntity(materialDomainGenre, "RANSE", "Ranse(10U/??l)", "??L")
    let ranseGenre = await createGenre(ranseEntity)
    createEntity(ranseGenre, "DEFAULT_LOT", 2, "Default LOT")

    let cot1Entity = await createMaterialEntity(materialDomainGenre, "COT_1", "COt-1", "??L")
    let cot1Genre = await createGenre(cot1Entity)
    createEntity(cot1Genre, "DEFAULT_LOT", 2, "Default LOT")

    let sssEntity = await createMaterialEntity(materialDomainGenre, "SSS_DNA", "sssDNA", "??L")
    let sssGenre = await createGenre(sssEntity)
    createEntity(sssGenre, "DEFAULT_LOT", 2, "Default LOT")

    let mp1Entity = await createMaterialEntity(materialDomainGenre, "MP_1", "MP 1.0(1000uM)", "??L")
    let mp1Genre = await createGenre(mp1Entity)
    createEntity(mp1Genre, "DEFAULT_LOT", 2, "Default LOT")

    let mp2Entity = await createMaterialEntity(materialDomainGenre, "MP_2", "MP 2.0", "??L")
    let mp2Genre = await createGenre(mp2Entity)
    createEntity(mp2Genre, "DEFAULT_LOT", 2, "Default LOT")

    let hybBufferEntity = await createMaterialEntity(materialDomainGenre, "HYB_BUFFER", "Hyb Buffer", "??L")
    let hybBufferGenre = await createGenre(hybBufferEntity)
    createEntity(hybBufferGenre, "DEFAULT_LOT", 2, "Default LOT")

    let bindingEntity = await createMaterialEntity(materialDomainGenre, "BINDING_BUFFER", "Binding Buffer", "??L")
    let bindingGenre = await createGenre(bindingEntity)
    createEntity(bindingGenre, "DEFAULT_LOT", 2, "Default LOT")

    let washingBuffer1Entity = await createMaterialEntity(materialDomainGenre, "WASHING_BUFFER_1", "Washing Buffer 1", "??L")
    let washingBuffer1Genre = await createGenre(washingBuffer1Entity)
    createEntity(washingBuffer1Genre, "DEFAULT_LOT", 2, "Default LOT")

    let washingBuffer2Entity = await createMaterialEntity(materialDomainGenre, "WASHING_BUFFER_2", "Washing Buffer 2", "??L")
    let washingBuffer2Genre = await createGenre(washingBuffer2Entity)
    createEntity(washingBuffer2Genre, "DEFAULT_LOT", 2, "Default LOT")

    let kapa5xFidelityEntity = await createMaterialEntity(materialDomainGenre, "5X_KAPA_HIFI_FIDELITY_BUFFER", "5X KAPA HiFi Fidelity buffer", "??L")
    let kapa5xFidelityGenre = await createGenre(kapa5xFidelityEntity)
    createEntity(kapa5xFidelityGenre, "DEFAULT_LOT", 2, "Default LOT")

    let kapa10mmDntpmixEntity = await createMaterialEntity(materialDomainGenre, "10MM_KAPA_DNTPMIX", "10mM KAPA dNTPMix", "??L")
    let kapa10mmDntpmixGenre = await createGenre(kapa10mmDntpmixEntity)
    createEntity(kapa10mmDntpmixGenre, "DEFAULT_LOT", 2, "Default LOT")

    let postPcrPrimerEntity = await createMaterialEntity(materialDomainGenre, "POST_PCR_PRIMER", "Post PCR Primer (25uM, for ILM)", "??L")
    let postPcrPrimerGenre = await createGenre(postPcrPrimerEntity)
    createEntity(postPcrPrimerGenre, "DEFAULT_LOT", 2, "Default LOT")

    let hotstartEntity = await createMaterialEntity(materialDomainGenre, "HIFI_HOTSTART_DNA_POLYMERASE", "HiFi HotStart DNA Polymerase", "??L")
    let hotstartGenre = await createGenre(hotstartEntity)
    createEntity(hotstartGenre, "DEFAULT_LOT", 2, "Default LOT")

    let magpureEntity = await createMaterialEntity(materialDomainGenre, "MAGPURE", "MagPure A3 XP", "??L")
    let magpureGenre = await createGenre(magpureEntity)
    createEntity(magpureGenre, "DEFAULT_LOT", 2, "Default LOT")//}}}

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
    Entity({
        SYS_IDENTIFIER: extractCollGenre.SYS_IDENTIFIER + "KAPA",
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: extractCollGenre.id,
        SYS_CHECKED: true,
        REMARK: '???????????????',
        SYS_SOURCE: kapaClassEntity.id,
        SYS_QUANTITY: 20,
    }).save()
    Entity({
        SYS_IDENTIFIER: extractCollGenre.SYS_IDENTIFIER + "TIP",
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: extractCollGenre.id,
        SYS_CHECKED: true,
        REMARK: '???????????????',
        SYS_SOURCE: tipClassEntity.id,
        SYS_QUANTITY: 2,
    }).save()


    // Extract BoMs{{{
    let extractBomOneEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_ONE", 2, "??????/??????/???????????? BoM")
    let extractBomOneGenre = await createGenre(extractBomOneEntity)
    createBomAttributes(extractBomOneGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomOneGenre,
        [
            {
                'material': materialBloodExtractKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )

    let extractBomTwoEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_TWO", 2, "??????/?????? BoM")
    let extractBomTwoGenre = await createGenre(extractBomTwoEntity)
    createBomAttributes(extractBomTwoGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomTwoGenre,
        [
            {
                'material': materialOrganBloodExtractKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )

    let extractBomThreeEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_THREE", 2, "?????????/???????????? BoM")
    let extractBomThreeGenre = await createGenre(extractBomThreeEntity)
    createBomAttributes(extractBomThreeGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomThreeGenre,
        [
            {
                'material': materialBlackPrepExtractKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )

    let extractBomFourEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_FOUR", 2, "??????/?????? BoM")
    let extractBomFourGenre = await createGenre(extractBomFourEntity)
    createBomAttributes(extractBomFourGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomFourGenre,
        [
            {
                'material': materialFaecesExtractKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )

    let extractBomFiveEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_FIVE", 2, "?????? BoM")
    let extractBomFiveGenre = await createGenre(extractBomFiveEntity)
    createBomAttributes(extractBomFiveGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomFiveGenre,
        [
            {
                'material': materialCirculatingExtractKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )

    let extractBomSixEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_SIX", 2, "DNA BoM")
    let extractBomSixGenre = await createGenre(extractBomSixEntity)
    createBomAttributes(extractBomSixGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomSixGenre,
        [
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )

    let extractBomSevenEntity = await createEntity(manuClassGenre, "EXTRACT_BOM_SEVEN", 2, "?????? BoM")
    let extractBomSevenGenre = await createGenre(extractBomSevenEntity)
    createBomAttributes(extractBomSevenGenre, materialDomainEntity)
    createBomSubEntity(
        extractBomSevenGenre,
        [
            {
                'material': materialHSBRQuantifyKitClassEntity,
                'quantity': 1,
            },
            {
                'material': materialAgaroseClassEntity,
                'quantity': 1,
            },
            {
                'material': materialSixLoadingBufferClassEntity,
                'quantity': 2,
            },
            {
                'material': materialLambdaDNAClassEntity,
                'quantity': 5,
            },
        ]
    )
    //}}}

    // Library Preparation BoM{{{
    let libraryPrepBomOneEntity = await createEntity(manuClassGenre, "LIBRARY_PREP_BOM_ONE", 2, "??????BoM")
    let libraryPrepBomOneGenre = await createGenre(libraryPrepBomOneEntity)
    createBomAttributes(libraryPrepBomOneGenre, materialDomainEntity)
    createBomSubEntity(
        libraryPrepBomOneGenre,
        [
            {
                'material': fastKitEntity,
                //'quantity': 0,
            },
        ]
    )//}}}

    // MultiPCR BoM{{{
    let multiPcrBomOneEntity = await createEntity(manuClassGenre, "MULTIPCR_BOM_ONE", 2, "??????BoM")
    let multiPcrBomOneGenre = await createGenre(multiPcrBomOneEntity)
    createBomAttributes(multiPcrBomOneGenre, materialDomainEntity)
    createBomSubEntity(
        multiPcrBomOneGenre,
        [
            {
                'material': IGTPolymeraseEntity,
                //'quantity': 0,
            },
            {
                'material': primerEntity,
                //'quantity': 0,
            },
            {
                'material': enhancerBufferEntity,
                //'quantity': 0,
            },
            {
                'material': yfBufferEntity,
                //'quantity': 0,
            },
            {
                'material': igtI5Entity,
                //'quantity': 0,
            },
            {
                'material': igtI7Entity,
                //'quantity': 0,
            },
        ]
    )//}}}

    // Capture BoM{{{
    let captureBomOneEntity = await createEntity(manuClassGenre, "CAPTURE_BOM_ONE", 2, "??????BoM")
    let captureBomOneGenre = await createGenre(captureBomOneEntity)
    createBomAttributes(captureBomOneGenre, materialDomainEntity)
    createBomSubEntity(
        captureBomOneGenre,
        [
            {
                'material': ranseEntity,
                'quantity': 2,
            },
            {
                'material': cot1Entity,
                'quantity': 2.5,
            },
            {
                'material': sssEntity,
                'quantity': 2.5,
            },
            {
                'material': mp1Entity,
                'quantity': 1,
            },
            {
                'material': mp2Entity,
                'quantity': 1,
            },
            {
                'material': hybBufferEntity,
                'quantity': 18,
            },
            {
                'material': bindingEntity,
                'quantity': 600,
            },
            {
                'material': washingBuffer1Entity,
                'quantity': 200,
            },
            {
                'material': washingBuffer2Entity,
                'quantity': 630,
            },
            {
                'material': kapa5xFidelityEntity,
                'quantity': 0.8,
            },
            {
                'material': kapa10mmDntpmixEntity,
                'quantity': 0.8,
            },
            {
                'material': postPcrPrimerEntity,
                'quantity': 8,
            },
            {
                'material': hotstartEntity,
                'quantity': 1.2,
            },
            {
                'material': magpureEntity,
                'quantity': 48,
            },
        ]
    )//}}}


    //}}}

    // Project Workcenter Domain{{{
    let projectWCDomainEntity = await createEntity(domainGenre, "PROJECT_MANAGEMENT", 0, "Project Management Workcenters")
    let projectWCDomainGenre = await createGenre(projectWCDomainEntity)
    let generalProjectClassEntity = await createEntity(projectWCDomainGenre, WC_ID_GENERAL_PROJECT, 1, "General Project")
    let generalProjectClassGenre = await createGenreWithAttributes(
        generalProjectClassEntity,
        {
            'SYS_IDENTIFIER': generalProjectClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    let attrGPSerialNumber = await createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "SERIAL_NUMBER"),
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectManager = await createAttribute({
        label: '???????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "PROJECT_MANAGER"),
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectCode = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "PROJECT_CODE"),
        SYS_ORDER: 30,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPPanelCode = await createAttribute({
        label: 'Panel??????',
        SYS_CODE: 'SYS_PANEL_CODE',
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDepth = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "DEPTH"),
        SYS_ORDER: 50,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: 'X',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDataSize = await createAttribute({
        label: '???????????????',
        SYS_CODE: 'SYS_DATA_SIZE',
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_ATTRIBUTE_UNIT: 'G',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleName = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "SAMPLE_NAME"),
        SYS_ORDER: 70,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleCode = await createAttribute({
        label: '????????????',
        // SYS prefix to indicate importance
        // to get the all the workcenters in
        // plan for the specific sample
        SYS_CODE: 'SYS_SAMPLE_CODE',
        SYS_ORDER: 80,
        SYS_TYPE: 'string',
        SYS_IS_ENTITY_LABEL: true,
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleType = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "SAMPLE_TYPE"),
        SYS_ORDER: 90,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleSpecies = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "SAMPLE_SPECIES"),
        SYS_ORDER: 100,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleRemark = await createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "REMARK"),
        SYS_ORDER: 180,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDateScheduled = await createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_SCHEDULED',
        SYS_ORDER: 190,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})

    // on board
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 1000,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 1010,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: generalProjectClassGenre.id})

    let generalProjectClassGenreOne = await createGenreWithAttributes(
        generalProjectClassEntity,
        {
            'SYS_IDENTIFIER': generalProjectClassEntity.SYS_IDENTIFIER + '_ONE/',
            'SYS_LABEL': 'label',
            'label': 'All Workcenters',
            'SYS_ORDER': 10,
            'enabled': true,
            'visible': true,
        }
    )

    let generalProjectClassGenreLiquid = await createGenreWithAttributes(
        generalProjectClassEntity,
        {
            'SYS_IDENTIFIER': generalProjectClassEntity.SYS_IDENTIFIER + '_LIQUID/',
            'SYS_LABEL': 'label',
            'label': '??????',
            'SYS_ORDER': 20,
            'enabled': true,
            'visible': true,
        }
    )
    let attrGPQCStartDate = await createAttribute({
        label: '??????????????????(??????)',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "QC_START_DATE"),
        SYS_ORDER: 140,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: false,
        SYS_GENRE: generalProjectClassGenreLiquid.id})
    let attrGPQCDeliveryDate = await createAttribute({
        label: '??????????????????(??????)',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "QC_DELIVERY_DATE"),
        SYS_ORDER: 150,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: false,
        SYS_GENRE: generalProjectClassGenreLiquid.id})

    let generalProjectClassGenreMultiplex = await createGenreWithAttributes(
        generalProjectClassEntity,
        {
            'SYS_IDENTIFIER': generalProjectClassEntity.SYS_IDENTIFIER + '_MULTIPLEX/',
            'SYS_LABEL': 'label',
            'label': '??????',
            'SYS_ORDER': 30,
            'enabled': true,
            'visible': true,
        }
    )
    let attrGPProjectStartDate = await createAttribute({
        label: '??????????????????(??????)',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "PROJECT_START_DATE"),
        SYS_ORDER: 160,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: false,
        SYS_GENRE: generalProjectClassGenreMultiplex.id})
    let attrGPProjectWarnDate = await createAttribute({
        label: '??????????????????(??????)',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "PROJECT_WARN_DATE"),
        SYS_ORDER: 170,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: false,
        SYS_GENRE: generalProjectClassGenreMultiplex.id})
    let attrGPProjectDeliveryDate = await createAttribute({
        label: '??????????????????(??????)',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "PROJECT_DELIVERY_DATE"),
        SYS_ORDER: 180,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: false,
        SYS_GENRE: generalProjectClassGenreMultiplex.id})

    let generalProjectClassGenreExternalLibrary = await createGenreWithAttributes(
        generalProjectClassEntity,
        {
            'SYS_IDENTIFIER': generalProjectClassEntity.SYS_IDENTIFIER + '_EXTERNAL_LIBRARY/',
            'SYS_LABEL': 'label',
            'label': '????????????',
            'SYS_ORDER': 40,
            'enabled': true,
            'visible': true,
        }
    )
    let attrGPLibraryType = await createAttribute({
        SYS_LABEL: 'label',
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "LIBRARY_TYPE"),
        SYS_ORDER: 210,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenreExternalLibrary.id})
    await createAttribute({
        SYS_LABEL: 'label',
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_GENERAL_PROJECT, "LIBRARY_LENGTH"),
        SYS_ORDER: 220,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenreExternalLibrary.id})
    await createAttribute({
        SYS_LABEL: 'label',
        label: 'Index??????(I7)',
        SYS_CODE: 'SYS_INDEX_EXT_SEQUENCE_I7',
        SYS_ORDER: 230,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenreExternalLibrary.id})
    await createAttribute({
        SYS_LABEL: 'label',
        label: 'Index??????(I5)',
        SYS_CODE: 'SYS_INDEX_EXT_SEQUENCE_I5',
        SYS_ORDER: 240,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenreExternalLibrary.id})

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
        label: '??????????????????',
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

    // DNA Extraction {{{
    let DNAExtractClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_EXTRACT, 1, "????????????", 10,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectManager.id,
                attrGPProjectCode.id,
                attrGPPanelCode.id,
                attrGPDepth.id,
                attrGPDataSize.id,
                attrGPSampleName.id,
                attrGPSampleCode.id,
            ],
        })

    let DNAExtractClassGenre = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    // in excel

    let attrDEConc = await createAttribute({
        label: 'DNA??????(ng/uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "CONC"),
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEVolume = await createAttribute({
        label: 'DNA??????(uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "VOLUME"),
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEAmount = await createAttribute({
        label: 'DNA??????(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "AMOUNT"),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEGrade = await createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "GRADE"),
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: DNAExtractClassGenre.id})

    // on board
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 1010,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 1020,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '????????????-1',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "INSTRUMENT_1"),
        SYS_ORDER: 1030,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '????????????-2',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "INSTRUMENT_2"),
        SYS_ORDER: 1040,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "ENV_TEMPERATURE"),
        SYS_ORDER: 1050,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '???',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "ENV_HUMIDITY"),
        SYS_ORDER: 1060,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '%RH',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenre.id})

    let DNAExtractClassGenreOne = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_ONE/',
            'SYS_LABEL': 'label',
            'label': '??????/??????/????????????',
            'SYS_ORDER': 20,
            'enabled': true,
            'visible': true,
        }
    )
    let DNAExtractClassGenreTwo = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_TWO/',
            'SYS_LABEL': 'label',
            'label': '??????/??????',
            'SYS_ORDER': 30,
            'enabled': true,
            'visible': true,
        }
    )
    let DNAExtractClassGenreThree = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_THREE/',
            'SYS_LABEL': 'label',
            'label': '?????????/????????????',
            'SYS_ORDER': 40,
            'enabled': true,
            'visible': true,
        }
    )
    let DNAExtractClassGenreFour = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_FOUR/',
            'SYS_LABEL': 'label',
            'label': '??????/??????',
            'SYS_ORDER': 50,
            'enabled': true,
            'visible': true,
        }
    )
    let DNAExtractClassGenreFive = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_FIVE/',
            'SYS_LABEL': 'label',
            'label': '??????',
            'SYS_ORDER': 60,
            'enabled': true,
            'visible': true,
        }
    )
    let DNAExtractClassGenreSix = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_SIX/',
            'SYS_LABEL': 'label',
            'label': 'DNA',
            'SYS_ORDER': 70,
            'enabled': true,
            'visible': true,
        }
    )
    let DNAExtractClassGenreSeven = await createGenreWithAttributes(
        DNAExtractClassEntity,
        {
            'SYS_IDENTIFIER': DNAExtractClassEntity.SYS_IDENTIFIER + '_SEVEN/',
            'SYS_LABEL': 'label',
            'label': '??????',
            'SYS_ORDER': 80,
            'enabled': true,
            'visible': true,
        }
    )

    createAttribute({
        SYS_LABEL: 'label',
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "TEMP_MATERIAL"),
        SYS_ORDER: 150,
        SYS_TYPE: 'string',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: DNAExtractClassGenreSeven.id})

    let DNAExtractClassGenreList = [
        DNAExtractClassGenreOne,
        DNAExtractClassGenreTwo,
        DNAExtractClassGenreThree,
        DNAExtractClassGenreFour,
        DNAExtractClassGenreFive,
        DNAExtractClassGenreSix,
        DNAExtractClassGenreSeven,
    ]

    let DNAExtractClassBoMList = [
        extractBomOneEntity,
        extractBomTwoEntity,
        extractBomThreeEntity,
        extractBomFourEntity,
        extractBomFiveEntity,
        extractBomSixEntity,
        extractBomSevenEntity,
    ]

    for (let index in DNAExtractClassGenreList) {
        let genre = DNAExtractClassGenreList[index]
        let bom = DNAExtractClassBoMList[index]
        createAttribute({
            label: 'BoM',
            SYS_CODE: 'BOM',
            SYS_ORDER: 500,
            SYS_TYPE: 'entity',
            SYS_TYPE_ENTITY: bom.id,
            SYS_TYPE_ENTITY_REF: false,
            SYS_FLOOR_ENTITY_TYPE: 'collection',
            SYS_GENRE: genre.id,
            SYS_IS_ON_BOARD: true,
        })
    }
    //}}}

    // DNA Shear{{{
    let dnaShearClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_SHEAR, 1, "??????", 30,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectManager.id,
                attrGPProjectCode.id,
                attrGPPanelCode.id,
                attrGPDepth.id,
                attrGPDataSize.id,
                attrGPSampleCode.id,
            ],
        })
    let dnaShearClassGenre = await createGenreWithAttributes(
        dnaShearClassEntity,
        {
            'SYS_IDENTIFIER': dnaShearClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    // on board
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "SAMPLING_DATE"),
        SYS_ORDER: 1000,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "SHEAR_DATE"),
        SYS_ORDER: 1010,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "ENV_TEMPERATURE"),
        SYS_ORDER: 1020,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '???',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "ENV_HUMIDITY"),
        SYS_ORDER: 1030,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '%RH',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '????????????-1',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "INSTRUMENT_1"),
        SYS_ORDER: 1040,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '????????????-2',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "INSTRUMENT_2"),
        SYS_ORDER: 1050,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 1060,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 1070,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: dnaShearClassGenre.id})

    // in excel
    let attrDSCode = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, 'CODE'),
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSUsageAmount = await createAttribute({
        label: '?????????(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "USAGE_AMOUNT"),
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSUsageVolume = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "USAGE_VOLUME"),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSWaterVolume = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "WATER_VOLUME"),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSRemark = await createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "REMARK"),
        SYS_ORDER: 180,
        SYS_TYPE: 'string',
        SYS_GENRE: dnaShearClassGenre.id})
    //}}}

    // Library Prepare{{{
    let libraryPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_LIBRARY_PREPARE, 1, "????????????", 40,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectCode.id,
                attrGPSampleCode.id,
                attrDSCode.id,
            ],
        })

    let libraryPrepareClassGenre = await createGenreWithAttributes(
        libraryPrepareClassEntity,
        {
            'SYS_IDENTIFIER': libraryPrepareClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    let libraryPrepareClassGenreOne = await createGenreWithAttributes(
        libraryPrepareClassEntity,
        {
            'SYS_IDENTIFIER': libraryPrepareClassEntity.SYS_IDENTIFIER + '_ONE/',
            'SYS_LABEL': 'label',
            'label': 'Standard Library',
            'SYS_ORDER': 10,
            'enabled': true,
            'visible': true,
        }
    )

    // on board
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "SAMPLING_DATE"),
        SYS_ORDER: 1000,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "PREPARE_DATE"),
        SYS_ORDER: 1010,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "ENV_TEMPERATURE"),
        SYS_ORDER: 1020,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '???',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "ENV_HUMIDITY"),
        SYS_ORDER: 1030,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '%RH',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????-1',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "INSTRUMENT_1"),
        SYS_ORDER: 1040,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????-2',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "INSTRUMENT_2"),
        SYS_ORDER: 1050,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 1060,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 1070,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: libraryPrepareClassGenre.id})

    createAttribute({
        label: 'BoM',
        SYS_LABEL: 'label',
        SYS_CODE: 'BOM2',
        SYS_ORDER: 500,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: libraryPrepBomOneEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryPrepareClassGenreOne.id,
        SYS_IS_ON_BOARD: true,
    })

    // in excel
    let attrLPCode = await createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_LIBRARY_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPIndexTpe1 = await createAttribute({
        label: 'TPE 1.0??????',
        SYS_CODE: 'SYS_INDEX_TPE_1',
        SYS_LABEL: 'label',
        SYS_ORDER: 20,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: tpeClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPIndexTpe2 = await createAttribute({
        label: 'TPE 2.0??????',
        SYS_CODE: 'SYS_INDEX_TPE_2',
        SYS_LABEL: 'label',
        SYS_ORDER: 30,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: tpeClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPConc = await createAttribute({
        label: '????????????(ng/uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'CONC'),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPVolume = await createAttribute({
        label: '????????????(uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'VOLUME'),
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPAmount = await createAttribute({
        label: '????????????(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'AMOUNT'),
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPResult = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "RESULT"),
        SYS_ORDER: 70,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPCycle = await createAttribute({
        label: '?????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'CYCLE'),
        SYS_ORDER: 80,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPDnaUsage = await createAttribute({
        label: 'DNA?????????(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'DNA_USAGE'),
        SYS_ORDER: 90,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPRemark = await createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, '_REMARK'),
        SYS_ORDER: 100,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    //}}}

    // Capture Prepare{{{
    let capturePrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_CAPTURE, 1, "????????????", 50,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectCode.id,
                attrGPPanelCode.id,
                attrGPDepth.id,
                attrGPDataSize.id,
                attrGPSampleCode.id,
                attrLPCode.id,
                attrLPIndexTpe1.id,
                attrLPIndexTpe2.id,
                attrLPConc.id,
                attrLPAmount.id,
            ],
        })

    let capturePrepareClassGenre = await createGenreWithAttributes(
        capturePrepareClassEntity,
        {
            'SYS_IDENTIFIER': capturePrepareClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    let capturePrepareClassGenreOne = await createGenreWithAttributes(
        capturePrepareClassEntity,
        {
            'SYS_IDENTIFIER': capturePrepareClassEntity.SYS_IDENTIFIER + '_ONE/',
            'SYS_LABEL': 'label',
            'label': 'Standard Capture',
            'SYS_ORDER': 10,
            'enabled': true,
            'visible': true,
        }
    )

    createAttribute({
        label: 'BoM',
        SYS_LABEL: 'label',
        SYS_CODE: 'BOM',
        SYS_ORDER: 500,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: captureBomOneEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: capturePrepareClassGenreOne.id,
        SYS_IS_ON_BOARD: true,
    })

    // on board
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "SAMPLING_DATE"),
        SYS_ORDER: 1000,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "CAPTURE_DATE"),
        SYS_ORDER: 1010,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "ENV_TEMPERATURE"),
        SYS_ORDER: 1020,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '???',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "ENV_HUMIDITY"),
        SYS_ORDER: 1030,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '%RH',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '????????????-1',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "INSTRUMENT_1"),
        SYS_ORDER: 1040,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '????????????-2',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "INSTRUMENT_2"),
        SYS_ORDER: 1050,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 1060,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 1070,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: capturePrepareClassGenre.id})

    // in excel
    let attrCPCode = await createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_CAPTURE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: capturePrepareClassGenre.id})
    let attrCPQubit = await createAttribute({
        label: '???????????????(ng/uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, 'QUBIT'),
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    let attrCPCount = await createAttribute({
        label: '?????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, 'HYBRID_COUNT'),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    let attrCPLibraryUsage = await createAttribute({
        label: '???????????????(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, 'LIBRARY_USAGE'),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    let attrCPVolume = await createAttribute({
        label: '????????????(uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, 'VOLUME'),
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    //}}}

    // Multiplex Library Prepare{{{
    let multiplexLibraryPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_MULTIPLEX_LIBRARY_PREPARE, 1, "??????????????????", 60,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPPanelCode.id,
                attrGPDataSize.id,
                attrGPSampleCode.id,
                attrDEConc.id,
                attrDEAmount.id,
            ],
        })

    let multiplexLibraryPrepareClassGenre = await createGenreWithAttributes(
        multiplexLibraryPrepareClassEntity,
        {
            'SYS_IDENTIFIER': multiplexLibraryPrepareClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    // on board
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "SAMPLING_DATE"),
        SYS_ORDER: 1000,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "PREPARE_DATE"),
        SYS_ORDER: 1010,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "ENV_TEMPERATURE"),
        SYS_ORDER: 1020,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '???',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "ENV_HUMIDITY"),
        SYS_ORDER: 1030,
        SYS_TYPE: 'string',
        SYS_ATTRIBUTE_UNIT: '%RH',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????-1',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "INSTRUMENT_1"),
        SYS_ORDER: 1040,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????-2',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "INSTRUMENT_2"),
        SYS_ORDER: 1050,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: sequencingClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 1060,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 1070,
        SYS_TYPE: 'date',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})

    // in excel
    let attrMLPDnaUsageAmount = await createAttribute({
        label: 'DNA?????????(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'DNA_USAGE_AMOUNT'),
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPDnaUsageVolume = await createAttribute({
        label: 'DNA????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'DNA_USAGE_VOLUME'),
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPDnaVolume = await createAttribute({
        label: '????????????(uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'DNA_USAGE_VOLUME_EXTRA'),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPWaterVolume = await createAttribute({
        label: '????????????(uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'WATER_USAGE_VOLUME_EXTRA'),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPIndexI5 = await createAttribute({
        label: 'IGT-I5??????',
        SYS_LABLE: 'label',
        SYS_CODE: 'SYS_INDEX_IGT_I5',
        SYS_ORDER: 50,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: igtClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPIndexI7 = await createAttribute({
        label: 'IGT-I7??????',
        SYS_LABLE: 'label',
        SYS_CODE: 'SYS_INDEX_IGT_I7',
        SYS_ORDER: 60,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: igtClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPConc = await createAttribute({
        label: '????????????(ng/uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'CONC'),
        SYS_ORDER: 70,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    let attrMLPResult = await createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, "RESULT"),
        SYS_ORDER: 80,
        SYS_TYPE: 'string',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    //}}}

    // Pooling{{{
    let poolingClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_POOLING, 1, "Pooling", 70,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectCode.id,
                attrGPSampleCode.id,
                attrGPSampleName.id,
                attrGPPanelCode.id,
                attrGPDataSize.id,
                attrGPSampleSpecies.id,
                attrLPIndexTpe1.id,
                attrLPIndexTpe2.id,
                attrMLPIndexI7.id,
                attrMLPIndexI5.id,
            ],
        })
    let poolingClassGenre = await createGenreWithAttributes(
        poolingClassEntity,
        {
            'SYS_IDENTIFIER': poolingClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )

    // on board
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 70,
        SYS_IS_ON_BOARD: true,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 80,
        SYS_IS_ON_BOARD: true,
        SYS_TYPE: 'date',
        SYS_GENRE: poolingClassGenre.id})

    // in excel
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'LIBRARY_NAME'),
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'LIBRARY_TYPE'),
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'LIBRARY_LENGTH'),
        SYS_ORDER: 30,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '??????ID',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'SYNTHETIC_ID'),
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '?????????(G)',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'DATA_SIZE'),
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: 'Qubit(ng/uL)',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'QUBIT'),
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'ANALYSIS_REQUIREMENT'),
        SYS_ORDER: 70,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '??????',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'SPECIES'),
        SYS_ORDER: 80,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '??????????????????',
        SYS_CODE: 'SYS_LANE_CODE',
        SYS_ORDER: 90,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    //}}}

    // Sequence Data{{{
    let dataSequenceClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_SEQUENCE_DATA, 1, "????????????", 80,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleName.id,
                attrGPPanelCode.id,
                attrGPDataSize.id,
                attrGPSampleSpecies.id,
            ],
        })
    let dataSequenceClassGenre = await createGenreWithAttributes(
        dataSequenceClassEntity,
        {
            'SYS_IDENTIFIER': dataSequenceClassEntity.SYS_IDENTIFIER + '/',
            'SYS_LABEL': 'label',
            'label': 'Common Genre',
            'SYS_ORDER': 100,
            'visible': false,
        }
    )
    createAttribute({
        label: '??????????????????',
        SYS_CODE: getAttributeIdentifier(WC_ID_SEQUENCE_DATA, "FILE_PATH"),
        SYS_ORDER: 10,
        SYS_IS_ON_BOARD: true,
        SYS_TYPE: 'string',
        SYS_GENRE: dataSequenceClassGenre.id})
    createAttribute({
        label: '?????????',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 20,
        SYS_IS_ON_BOARD: true,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: dataSequenceClassGenre.id})
    createAttribute({
        label: '????????????',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_IS_ON_BOARD: true,
        SYS_ORDER: 30,
        SYS_TYPE: 'date',
        SYS_GENRE: dataSequenceClassGenre.id})
    //}}}

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

    // Standard Product Routing{{{
    let standardRoutingEntity = await createEntity(productRoutingClassGenre, "STANDARD_PRODUCT_ROUTING", 2, "??????????????????")
    let standardRoutingGenre = await createGenre(standardRoutingEntity)
    createAttribute({
        label: 'Routing',
        SYS_LABEL: 'label',
        SYS_CODE: 'ROUTING',
        SYS_ORDER: 500,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: standardRoutingEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: generalProjectClassGenreOne.id
    })
    createRoutingAttributes(standardRoutingGenre, productRoutingClassEntity)
    createRoutingSubEntity(
        standardRoutingGenre,
        [
            {
                'workcenter': DNAExtractClassEntity,
                'duration': 2,
                'checked': true,
            },
            {
                'workcenter': dnaShearClassEntity,
                'duration': 2,
                'checked': true,
            },
            {
                'workcenter': libraryPrepareClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': capturePrepareClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': multiplexLibraryPrepareClassEntity,
                'duration': 2,
                'checked': false,
            },
            {
                'workcenter': poolingClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': dataSequenceClassEntity,
                'duration': 7,
                'checked': true,
            },
        ]
    )
    //}}}

    // Liquid Phase Routing{{{
    let liquidRoutingEntity = await createEntity(productRoutingClassGenre, "LIQUID_PHASE_ROUTING", 2, "??????????????????")
    let liquidRoutingGenre = await createGenre(liquidRoutingEntity)
    createAttribute({
        label: 'Routing',
        SYS_LABEL: 'label',
        SYS_CODE: 'ROUTING',
        SYS_ORDER: 500,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: liquidRoutingEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: generalProjectClassGenreLiquid.id
    })
    createRoutingAttributes(liquidRoutingGenre, productRoutingClassEntity)
    createRoutingSubEntity(
        liquidRoutingGenre,
        [
            {
                'workcenter': DNAExtractClassEntity,
                'duration': 2,
                'checked': true,
            },
            {
                'workcenter': dnaShearClassEntity,
                'duration': 2,
                'checked': true,
            },
            {
                'workcenter': libraryPrepareClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': capturePrepareClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': poolingClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': dataSequenceClassEntity,
                'duration': 7,
                'checked': true,
            },
        ]
    )
    //}}}

    // Multiplex Routing{{{
    let multiplexRoutingEntity = await createEntity(productRoutingClassGenre, "MULTIPLEX_LIBRARY_ROUTING", 2, "??????????????????")
    let multiplexRoutingGenre = await createGenre(multiplexRoutingEntity)
    createAttribute({
        label: 'Routing',
        SYS_LABEL: 'label',
        SYS_CODE: 'ROUTING',
        SYS_ORDER: 500,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: multiplexRoutingEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: generalProjectClassGenreMultiplex.id
    })
    createRoutingAttributes(multiplexRoutingGenre, productRoutingClassEntity)
    createRoutingSubEntity(
        multiplexRoutingGenre,
        [
            {
                'workcenter': DNAExtractClassEntity,
                'duration': 2,
                'checked': true,
            },
            {
                'workcenter': multiplexLibraryPrepareClassEntity,
                'duration': 2,
                'checked': true,
            },
            {
                'workcenter': poolingClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': dataSequenceClassEntity,
                'duration': 7,
                'checked': true,
            },
        ]
    )
    //}}}

    // External Library Routing{{{
    let externalLibraryRoutingEntity = await createEntity(productRoutingClassGenre, "EXTERNAL_LIBRARY_ROUTING", 2, "??????????????????")
    let externalLibraryRoutingGenre = await createGenre(externalLibraryRoutingEntity)
    createAttribute({
        label: 'Routing',
        SYS_LABEL: 'label',
        SYS_CODE: 'ROUTING',
        SYS_ORDER: 500,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: externalLibraryRoutingEntity.id,
        SYS_TYPE_ENTITY_REF: false,
        SYS_FLOOR_ENTITY_TYPE: 'class',
        SYS_IS_ON_BOARD: true,
        SYS_GENRE: generalProjectClassGenreExternalLibrary.id
    })
    createRoutingAttributes(externalLibraryRoutingGenre, productRoutingClassEntity)
    createRoutingSubEntity(
        externalLibraryRoutingGenre,
        [
            {
                'workcenter': poolingClassEntity,
                'duration': 5,
                'checked': true,
            },
            {
                'workcenter': dataSequenceClassEntity,
                'duration': 7,
                'checked': true,
            },
        ]
    )
    //}}}

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

    console.log(">>> done")

}
