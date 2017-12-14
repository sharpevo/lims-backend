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
        label: label.replace(" Genre","")
    })
        .save()
        .catch(err => {
            console.log("createEntity", err)
        })
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
    createEntityWithAttributes(hrClassGenre, "001", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "实验员", "SYS_USER_EMAIL":"yang.wu@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "002", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "项目经理", "SYS_USER_EMAIL":"jingwei.guan@igenetech.com"})
    createEntityWithAttributes(hrClassGenre, "003", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "系统管理员", "SYS_USER_EMAIL":"quwubin@gmail.com"})
    createEntityWithAttributes(hrClassGenre, "004", 2, {"SYS_LABEL": "SYS_USER_NAME", "SYS_USER_NAME": "生产部管理员", "SYS_USER_EMAIL":"xiaoxiao.zhang@igenetech.com"})
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

    // Project Workcenter Domain{{{
    let projectWCDomainEntity = await createEntity(domainGenre, "PROJECT_MANAGEMENT", 0, "Project Management Workcenters")
    let projectWCDomainGenre = await createGenre(projectWCDomainEntity)
    let generalProjectClassEntity = await createEntity(projectWCDomainGenre, "GENERAL_PROJECT", 1, "General Project")
    let generalProjectClassGenre = await createGenre(generalProjectClassEntity)
    let attrGPSampleCode = await createAttribute({
        label: '样品编号',
        // SYS prefix to indicate importance
        // to get the all the workcenters in
        // plan for the specific sample
        SYS_CODE: 'SYS_SAMPLE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_IS_ENTITY_LABEL: true,
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleName = await createAttribute({
        label: '样品名称',
        SYS_CODE: 'SAMPLE_NAME',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleType = await createAttribute({
        label: '样品类型',
        SYS_CODE: 'SAMPLE_TYPE',
        SYS_ORDER: 30,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleSpecies = await createAttribute({
        label: '样品物种',
        SYS_CODE: 'CONF_SAMPLE_SPECIES',
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPSampleMedium = await createAttribute({
        label: '样品保存介质',
        SYS_CODE: 'CONF_SAMPLE_MEDIUM',
        SYS_ORDER: 50,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDateScheduled = await createAttribute({
        label: '计划进度',
        SYS_CODE: 'SYS_DATE_SCHEDULED',
        SYS_ORDER: 60,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPPanelCode = await createAttribute({
        label: 'Panel编号',
        SYS_CODE: 'SYS_PANEL_CODE',
        SYS_ORDER: 70,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDataSize = await createAttribute({
        label: '数据量',
        SYS_CODE: 'SYS_DATA_SIZE',
        SYS_ORDER: 80,
        SYS_TYPE: 'number',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDepth = await createAttribute({
        label: '测序深度',
        SYS_CODE: 'SEQUENCING_DEPTH',
        SYS_ORDER: 90,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPIndexCode = await createAttribute({
        label: 'Index编号',
        SYS_CODE: 'SYS_INDEX_CODE',
        SYS_ORDER: 100,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPIndexSequence = await createAttribute({
        label: 'Index序列',
        SYS_CODE: 'SYS_INDEX_SEQUENCE',
        SYS_ORDER: 110,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectCode = await createAttribute({
        label: '项目编号',
        SYS_CODE: 'CONF_PROJECT_CODE',
        SYS_ORDER: 120,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectManager = await createAttribute({
        label: '项目负责人',
        SYS_CODE: 'CONF_PROJECT_MANAGER',
        SYS_ORDER: 130,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectStarted = await createAttribute({
        label: '项目启动时间',
        SYS_CODE: 'CONF_PROJECT_STARTED_DATE',
        SYS_ORDER: 140,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectCompleted = await createAttribute({
        label: '项目结束时间',
        SYS_CODE: 'CONF_PROJECT_COMPLETED_DATE',
        SYS_ORDER: 150,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 160,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: generalProjectClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 170,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
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

    // DNA Extraction {{{
    let DNAExtractClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_EXTRACT, 1, "样品提取", 10,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectManager.id,
                attrGPProjectCode.id,
                attrGPProjectStarted.id,
                //attrGPProjectCompleted.id,
                attrGPPanelCode.id,
                attrGPDepth.id,
                attrGPSampleName.id,
                attrGPSampleCode.id,
                attrGPSampleMedium.id,
                attrGPSampleSpecies.id,
            ],
        })
    let DNAExtractClassGenre = await createGenre(DNAExtractClassEntity)
    let attrDENanodrop = await createAttribute({
        label: 'Nanodrop ng/ul',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "NANODROP"),
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEQubit = await createAttribute({
        label: 'Qubit ng/ul',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "QUBIT"),
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDE230 = await createAttribute({
        label: 'OD 260/230',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "OD230"),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDE280 = await createAttribute({
        label: 'OD 260/280',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "OD280"),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEVolume = await createAttribute({
        label: '样品体积(ul)',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "VOLUME"),
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEAmount = await createAttribute({
        label: '样品总量(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "AMOUNT"),
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEQCGrade = await createAttribute({
        label: '质检结论',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "QC_RESULT"),
        SYS_ORDER: 70,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEQCRemark = await createAttribute({
        label: '质检备注',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "QC_REMARK"),
        SYS_ORDER: 80,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,0:只电泳检测,-1:不合格',
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '质检启动时间',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "QC_START_DATE"),
        SYS_ORDER: 90,
        SYS_TYPE: 'date',
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '质检完成时间',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "QC_COMPLETE_DATE"),
        SYS_ORDER: 100,
        SYS_TYPE: 'date',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDEReport = await createAttribute({
        label: '报告交付时间',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "REPORT_DELIVER_DATE"),
        SYS_ORDER: 110,
        SYS_TYPE: 'date',
        SYS_GENRE: DNAExtractClassGenre.id})
    let attrDERemark = await createAttribute({
        label: '备注(DNA提取来源)',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "REMARK"),
        SYS_ORDER: 120,
        SYS_TYPE: 'string',
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 130,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: DNAExtractClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 140,
        SYS_TYPE: 'date',
        SYS_GENRE: DNAExtractClassGenre.id})
    //}}}

    // Project Approve{{{
    let projectApprovalClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_APPROVE, 1, "项目审核", 20,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectCode.id,
                attrGPPanelCode.id,
                attrGPProjectCode.id,
                attrDEReport.id,
                attrDEQCGrade.id,
                attrDEAmount.id,
                attrGPSampleType.id,
            ],
        })
    let projectApprovalClassGenre = await createGenre(projectApprovalClassEntity)
    createAttribute({
        label: '审核结果',
        SYS_CODE: getAttributeIdentifier(WC_ID_APPROVE, 'RESULT'),
        SYS_ORDER: 10,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:通过,-1:不通过',
        SYS_GENRE: projectApprovalClassGenre.id})
    let attrPAStart = await createAttribute({
        label: '项目启动时间',
        SYS_CODE: getAttributeIdentifier(WC_ID_APPROVE, 'START_DATE'),
        SYS_ORDER: 20,
        SYS_TYPE: 'date',
        SYS_GENRE: projectApprovalClassGenre.id})
    let attrPAWarn = await createAttribute({
        label: '项目预警时间',
        SYS_CODE: getAttributeIdentifier(WC_ID_APPROVE, 'WARN_DATE'),
        SYS_ORDER: 30,
        SYS_TYPE: 'date',
        SYS_GENRE: projectApprovalClassGenre.id})
    let attrPADeliver = await createAttribute({
        label: '项目交付时间',
        SYS_CODE: getAttributeIdentifier(WC_ID_APPROVE, 'DELIVER_DATE'),
        SYS_ORDER: 40,
        SYS_TYPE: 'date',
        SYS_GENRE: projectApprovalClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 50,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: projectApprovalClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 60,
        SYS_TYPE: 'date',
        SYS_GENRE: projectApprovalClassGenre.id})
    //}}}

    // DNA Shear{{{
    let dnaShearClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_SHEAR, 1, "打断", 30,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectCode.id,
                attrGPPanelCode.id,
                attrGPDepth.id,
                attrGPSampleName.id,
                attrGPSampleCode.id,
                attrDENanodrop.id,
                attrDEQubit.id,
                attrDE280.id,
                attrDE230.id,
                attrDEVolume.id,
                attrDEAmount.id,
            ],
        })
    let dnaShearClassGenre = await createGenre(dnaShearClassEntity)
    createAttribute({
        label: '打断日期',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, "DATE"),
        SYS_ORDER: 10,
        SYS_TYPE: 'date',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSCode = await createAttribute({
        label: '打断编号',
        SYS_CODE: getAttributeIdentifier(WC_ID_SHEAR, 'CODE'),
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSUsageAmount = await createAttribute({
        label: '样品投入量',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "USAGE_AMOUNT"),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSRemainAmount = await createAttribute({
        label: '样品剩余量',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "REMAIN_AMOUNT"),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSUsageVolume = await createAttribute({
        label: '取样体积',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "USAGE_VOLUME"),
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSWaterVolume = await createAttribute({
        label: '补水体积',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "WATER_VOLUME"),
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 70,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: dnaShearClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 80,
        SYS_TYPE: 'date',
        SYS_GENRE: dnaShearClassGenre.id})
    //}}}

    // Library Prepare{{{
    let libraryPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_LIBRARY_PREPARE, 1, "文库制备", 40,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrDSCode.id,
                attrGPPanelCode.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
                attrGPDepth.id,
                attrGPSampleName.id,
                attrGPSampleCode.id,
                attrGPSampleType.id,
                attrGPProjectStarted.id,
                attrGPProjectCompleted.id,
            ],
        })

    let libraryPrepareClassGenre = await createGenre(libraryPrepareClassEntity)
    let attrLPDate = await createAttribute({
        label: '建库日期',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "DATE"),
        SYS_ORDER: 10,
        SYS_TYPE: 'date',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPCode = await createAttribute({
        label: '建库编号',
        SYS_CODE: 'SYS_LIBRARY_CODE',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPQubit = await createAttribute({
        label: 'Qubit(ng/ul)',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'QUBIT'),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPVolume = await createAttribute({
        label: '体积',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'VOLUME'),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPTotal = await createAttribute({
        label: 'Total(ng)',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'TOTAL'),
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPCycle = await createAttribute({
        label: '循环数',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'CYCLE'),
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPResult = await createAttribute({
        label: '建库结论',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, "RESULT"),
        SYS_ORDER: 70,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,0:风险,-1:不合格',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLPGrade = await createAttribute({
        label: '质检评级',
        SYS_CODE: getAttributeIdentifier(WC_ID_EXTRACT, "GRADE"),
        SYS_ORDER: 80,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,0:污染,-1:不合格',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '样品投入量',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'SAMPLE_USAGE'),
        SYS_ORDER: 90,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '样品剩余量',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, 'SAMPLE_LEFT'),
        SYS_ORDER: 100,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '备注',
        SYS_CODE: getAttributeIdentifier(WC_ID_LIBRARY_PREPARE, '_REMARK'),
        SYS_ORDER: 110,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 120,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 130,
        SYS_TYPE: 'date',
        SYS_GENRE: libraryPrepareClassGenre.id})
    //}}}

    // Capture Prepare{{{
    let capturePrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_CAPTURE, 1, "文库捕获", 50,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrLPDate.id,
                attrLPCode.id,
                attrGPPanelCode.id,
                attrGPDepth.id,
                attrGPSampleName.id,
                attrGPSampleCode.id,
                attrGPSampleType.id,
                attrGPDataSize.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
                attrLPQubit.id,
                attrLPVolume.id,
                attrLPTotal.id,
                attrLPCycle.id,
                attrLPResult.id,
                attrLPGrade.id,
            ],
        })
    let capturePrepareClassGenre = await createGenre(capturePrepareClassEntity)
    let attrCPCode = await createAttribute({
        label: '捕获编号',
        SYS_CODE: 'SYS_CAPTURE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '捕获日期',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, "DATE"),
        SYS_ORDER: 20,
        SYS_TYPE: 'date',
        SYS_GENRE: capturePrepareClassGenre.id})
    let attrCPCount = await createAttribute({
        label: '杂交数',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, 'HYBRID_COUNT'),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    let attrCPVolume = await createAttribute({
        label: '混样提及',
        SYS_CODE: getAttributeIdentifier(WC_ID_CAPTURE, 'VOLUME'),
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 50,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: capturePrepareClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 60,
        SYS_TYPE: 'date',
        SYS_GENRE: capturePrepareClassGenre.id})
    //}}}

    // Multiplex Library Prepare{{{
    let multiplexLibraryPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_MULTIPLEX_LIBRARY_PREPARE, 1, "多重文库制备", 60,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrDSCode.id,
                attrGPPanelCode.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
                attrGPDepth.id,
                attrGPSampleName.id,
                attrGPSampleCode.id,
                attrGPSampleType.id,
                attrGPProjectStarted.id,
                attrGPProjectCompleted.id,
            ],
        })

    let multiplexLibraryPrepareClassGenre = await createGenre(multiplexLibraryPrepareClassEntity)
    createAttribute({
        label: '样本位置',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'SAMPLE_LOCATION'),
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: 'gDNA浓度',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'GDNA_CONC'),
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: 'gDNA浓度均一化',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'GDNA_CONC_HOMOGENIZED'),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '多重文库名称',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'NAME'),
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '多重文库Index编号',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'INDEX_CODE'),
        SYS_ORDER: 50,
        SYS_TYPE: 'string',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '多重文库浓度',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'CONC'),
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '多重文库体积',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'VOLUME'),
        SYS_ORDER: 70,
        SYS_TYPE: 'number',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '备注',
        SYS_CODE: getAttributeIdentifier(WC_ID_MULTIPLEX_LIBRARY_PREPARE, 'REMARK'),
        SYS_ORDER: 80,
        SYS_TYPE: 'string',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 90,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 30,
        SYS_TYPE: 'date',
        SYS_GENRE: multiplexLibraryPrepareClassGenre.id})
    //}}}

    // Pooling{{{
    let poolingClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_POOLING, 1, "Pooling", 70,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleName.id,
                attrGPPanelCode.id,
                attrGPDataSize.id,
                attrGPSampleSpecies.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
            ],
        })
    let poolingClassGenre = await createGenre(poolingClassEntity)
    createAttribute({
        label: '混合文库名称',
        SYS_CODE: 'SYS_LANE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '文库类型',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'LIBRARY_TYPE'),
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '文库长度',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'LIBRARY_LENGTH'),
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '合成ID',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'SYNTHETIC_ID'),
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '分析要求',
        SYS_CODE: getAttributeIdentifier(WC_ID_POOLING, 'ANALYSIS_REQUIREMENT'),
        SYS_ORDER: 50,
        SYS_TYPE: 'string',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 60,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: poolingClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 70,
        SYS_TYPE: 'date',
        SYS_GENRE: poolingClassGenre.id})
    //}}}

    // Sequence Data{{{
    let dataSequenceClassEntity = await createEntityWithOrder(prodWCDomainGenre, WC_ID_SEQUENCE_DATA, 1, "数据下机", 80,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleName.id,
                attrGPPanelCode.id,
                attrGPDataSize.id,
                attrGPSampleSpecies.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
            ],
        })
    let dataSequenceClassGenre = await createGenre(dataSequenceClassEntity)
    createAttribute({
        label: '数据文件路径',
        SYS_CODE: getAttributeIdentifier(WC_ID_SEQUENCE_DATA, "FILE_PATH"),
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: dataSequenceClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 20,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: dataSequenceClassGenre.id})
    createAttribute({
        label: '操作日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
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
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_EXTRACT,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 10,
        SYS_SOURCE: DNAExtractClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_APPROVE,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 20,
        SYS_SOURCE: projectApprovalClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_SHEAR,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 30,
        SYS_SOURCE: dnaShearClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_LIBRARY_PREPARE,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 40,
        SYS_SOURCE: libraryPrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_CAPTURE,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 50,
        SYS_SOURCE: capturePrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_MULTIPLEX_LIBRARY_PREPARE,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: false,
        SYS_ORDER: 60,
        SYS_SOURCE: multiplexLibraryPrepareClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_POOLING,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 70,
        SYS_SOURCE: poolingClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + '_' + WC_ID_SEQUENCE_DATA,
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 80,
        SYS_SOURCE: dataSequenceClassEntity.id,
        SYS_DURATION: 7,
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

    console.log(">>> done")

}
