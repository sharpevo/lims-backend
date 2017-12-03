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
    let attrGPDateScheduled = await createAttribute({
        label: '计划进度',
        SYS_CODE: 'SYS_DATE_SCHEDULED',
        SYS_ORDER: 40,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPPanelCode = await createAttribute({
        label: 'Panel编号',
        SYS_CODE: 'SYS_PANEL_CODE',
        SYS_ORDER: 50,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDataSize = await createAttribute({
        label: '数据量',
        SYS_CODE: 'SYS_DATA_SIZE',
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPDepth = await createAttribute({
        label: '测序深度',
        SYS_CODE: 'SEQUENCING_DEPTH',
        SYS_ORDER: 70,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPIndexCode = await createAttribute({
        label: 'Index编号',
        SYS_CODE: 'SYS_INDEX_CODE',
        SYS_ORDER: 80,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPIndexSequence = await createAttribute({
        label: 'Index序列',
        SYS_CODE: 'SYS_INDEX_SEQUENCE',
        SYS_ORDER: 90,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectCode = await createAttribute({
        label: '项目编号',
        SYS_CODE: 'CONF_PROJECT_CODE',
        SYS_ORDER: 100,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectManager = await createAttribute({
        label: '项目负责人',
        SYS_CODE: 'CONF_PROJECT_MANAGER',
        SYS_ORDER: 110,
        SYS_TYPE: 'string',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectStarted = await createAttribute({
        label: '项目启动时间',
        SYS_CODE: 'CONF_PROJECT_STARTED_DATE',
        SYS_ORDER: 120,
        SYS_TYPE: 'date',
        SYS_GENRE: generalProjectClassGenre.id})
    let attrGPProjectCompleted = await createAttribute({
        label: '项目结束时间',
        SYS_CODE: 'CONF_PROJECT_COMPLETED_DATE',
        SYS_ORDER: 130,
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

    // Sample Extraction{{{
    //let sampleExtractClassEntity = await createEntityWithOrder(prodWCDomainGenre, "SAMPLE_EXTRACT_ASSIGN", 1, "样品提取", 10,
    //{
    //'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
    //'SYS_AUXILIARY_ATTRIBUTE_LIST': [
    //attrGPSampleCode.id,
    //attrGPSampleName.id
    //],
    //})
    //let sampleExtractClassGenre = await createGenre(sampleExtractClassEntity)
    //await createAttribute({
    //label: '提取人',
    //SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
    //SYS_ORDER: 100,
    //SYS_TYPE: 'entity',
    //SYS_TYPE_ENTITY: hrClassEntity.id,
    //SYS_TYPE_ENTITY_REF: true,
    //SYS_FLOOR_ENTITY_TYPE: 'collection',
    //SYS_GENRE: sampleExtractClassGenre.id})
    //}}}

    // Sample Extract Result{{{
    let sampleExtractResultClassEntity = await createEntityWithOrder(prodWCDomainGenre, "SAMPLE_EXTRACT_RESULT", 1, "样品提取", 10,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleCode.id,
                attrGPSampleName.id
            ],
        })
    sampleExtractResultClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let sampleExtractResultClassGenre = await createGenre(sampleExtractResultClassEntity)
    createAttribute({
        label: 'Nanodrop ng/ul',
        SYS_CODE: 'CONF_NANO_CONC',
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: 'Qubit ng/ul',
        SYS_CODE: 'CONF_QUBIT_CONC',
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: 'OD 260/230',
        SYS_CODE: 'CONF_OD230',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: 'OD 260/280',
        SYS_CODE: 'CONF_OD280',
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '样品体积(ul)',
        SYS_CODE: 'CONF_VOLUME',
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '样品总量(ng)',
        SYS_CODE: 'CONF_QUANTITY',
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    let attrSERResult = await createAttribute({
        label: '质检结论',
        SYS_CODE: 'CONF_QC_RESULT',
        SYS_ORDER: 70,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'A:A,B:B,Ca:C-a,Cb:C-b,Cd:C-d,D:D',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '质检备注',
        SYS_CODE: 'CONF_QC_REMARK',
        SYS_ORDER: 80,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,0:只电泳检测,-1:不合格',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '质检启动时间',
        SYS_CODE: 'SYS_DATE_STARTED',
        SYS_ORDER: 90,
        SYS_TYPE: 'date',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '报告交付时间',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 100,
        SYS_TYPE: 'date',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '备注',
        SYS_CODE: 'CONF_EXTRACT_REMARK',
        SYS_ORDER: 110,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: '1:合格,0:只电泳检测,-1:不合格',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 120,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY_REF: true,
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: sampleExtractResultClassGenre.id})
    //}}}

    // DNA Shear
    let dnaShearClassEntity = await createEntityWithOrder(prodWCDomainGenre, "DNA_SHEAR", 1, "打断", 20,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPProjectCode.id,
                attrGPPanelCode.id,
            ],
        })
    dnaShearClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let dnaShearClassGenre = await createGenre(dnaShearClassEntity)
    createAttribute({
        label: '打断日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 10,
        SYS_TYPE: 'date',
        SYS_GENRE: dnaShearClassGenre.id})
    let attrDSCode = await createAttribute({
        label: '打断编号',
        SYS_CODE: 'CONF_SHEARC_CODE',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: dnaShearClassGenre.id})

    // Sample QC Review{{{
    //let sampleQCReviewClassEntity = await createEntityWithOrder(prodWCDomainGenre, "SAMPLE_QC_REVIEW", 1, "样品质检", 30,
    //{
    //'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
    //'SYS_AUXILIARY_ATTRIBUTE_LIST': [
    //attrGPSampleCode.id,
    //attrGPSampleName.id,
    //attrSERResult.id,
    //attrSERStatus.id
    //],
    //})
    //sampleQCReviewClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    //let sampleQCReviewClassGenre = await createGenre(sampleQCReviewClassEntity)
    //await createAttribute({
    //label: '审核员',
    //SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
    //SYS_ORDER: 10,
    //SYS_TYPE: 'entity',
    //SYS_TYPE_ENTITY_REF: true,
    //SYS_TYPE_ENTITY: hrClassEntity.id,
    //SYS_FLOOR_ENTITY_TYPE: 'collection',
    //SYS_GENRE: sampleQCReviewClassGenre.id})
    //}}}

    // Library Prepare{{{
    let libraryPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "LIBRARY_RESULT", 1, "文库制备", 40,
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

    libraryPrepareClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let libraryPrepareClassGenre = await createGenre(libraryPrepareClassEntity)
    createAttribute({
        label: '建库日期',
        SYS_CODE: 'SYS_DATE_COMPLETED',
        SYS_ORDER: 10,
        SYS_TYPE: 'date',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLRName = await createAttribute({
        label: '建库编号',
        SYS_CODE: 'LIBRARY_CODE',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLRConc = await createAttribute({
        label: 'Qubit(ng/ul)',
        SYS_CODE: 'QUBIT_CONC',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    let attrLRVolume = await createAttribute({
        label: '体积',
        SYS_CODE: 'LIBRARY_VOLUME',
        SYS_ORDER: 40,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: 'Total(ng)',
        SYS_CODE: 'CONF_SAMPLE_QUANTITY_TOTAL',
        SYS_ORDER: 50,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '样品投入量',
        SYS_CODE: 'CONF_SAMPLE_QUANTITY_USED',
        SYS_ORDER: 60,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '样品剩余量',
        SYS_CODE: 'CONF_SAMPLE_QUATNITY_LEFT',
        SYS_ORDER: 70,
        SYS_TYPE: 'number',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 80,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '备注',
        SYS_CODE: 'CONF_EXTRACT_REMARK',
        SYS_ORDER: 90,
        SYS_TYPE: 'string',
        SYS_GENRE: libraryPrepareClassGenre.id})
    createAttribute({
        label: '捕获日期',
        SYS_CODE: 'CONF_CAPTURE_DATE',
        SYS_ORDER: 100,
        SYS_TYPE: 'date',
        SYS_GENRE: libraryPrepareClassGenre.id})
    //}}}

    // Library Review{{{
    let libraryReviewClassEntity = await createEntityWithOrder(prodWCDomainGenre, "LIBRARY_REVIEW", 1, "文库制备结果审核", 50,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleCode.id,
                attrGPSampleName.id,
                attrLRName.id,
                attrLRConc.id,
                attrLRVolume.id
            ],
        })
    libraryReviewClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
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
    //}}}

    // Capture Prepare{{{
    let capturePrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "CAPTURE_PREPARE", 1, "文库捕获", 60,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleCode.id,
                attrGPSampleName.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
                attrGPPanelCode.id,
            ],
        })
    capturePrepareClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let capturePrepareClassGenre = await createGenre(capturePrepareClassEntity)
    let attrCPCode = await createAttribute({
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
    let attrCPCount = await createAttribute({
        label: '杂交数',
        SYS_CODE: 'HYBRID_COUNT',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: capturePrepareClassGenre.id})
    //}}}

    // Capture Result{{{
    let captureResultClassEntity = await createEntityWithOrder(prodWCDomainGenre, "CAPTURE_RESULT", 1, "文库捕获结果", 70,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [attrGPSampleCode.id, attrGPSampleName.id, attrCPCode.id, attrCPCount.id],
        })
    captureResultClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let captureResultClassGenre = await createGenre(captureResultClassEntity)
    let attrCRConc = await createAttribute({
        label: '捕获后文库浓度',
        SYS_CODE: 'CAPTURE_CONC',
        SYS_ORDER: 10,
        SYS_TYPE: 'number',
        SYS_GENRE: captureResultClassGenre.id})
    let attrCRSize = await createAttribute({
        label: '片段大小',
        SYS_CODE: 'CAPTURE_FRAGMENT_SIZE',
        SYS_ORDER: 20,
        SYS_TYPE: 'number',
        SYS_GENRE: captureResultClassGenre.id})
    //}}}

    // Lane Prepare{{{
    let lanePrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "LANE_PREPARE", 1, "Pooling", 80,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleName.id,
                attrGPPanelCode.id,
                attrGPDataSize.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
                attrGPSampleType.id,
            ],
        })
    lanePrepareClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let lanePrepareClassGenre = await createGenre(lanePrepareClassEntity)
    let attrLPCode = await createAttribute({
        label: '混合文库名称',
        SYS_CODE: 'SYS_LANE_CODE',
        SYS_ORDER: 10,
        SYS_TYPE: 'string',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '文库类型',
        SYS_CODE: 'CONF_LANE_TYPE',
        SYS_ORDER: 20,
        SYS_TYPE: 'string',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '文库长度',
        SYS_CODE: 'CONF_LANE_LENGTH',
        SYS_ORDER: 30,
        SYS_TYPE: 'number',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '合成ID',
        SYS_CODE: 'CONF_LANE_TYPE',
        SYS_ORDER: 40,
        SYS_TYPE: 'string',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '分析要求',
        SYS_CODE: 'CONF_ANALYSIS_REQUIREMENT',
        SYS_ORDER: 50,
        SYS_TYPE: 'string',
        SYS_GENRE: lanePrepareClassGenre.id})
    createAttribute({
        label: '操作人',
        SYS_CODE: 'SYS_WORKCENTER_OPERATOR',
        SYS_ORDER: 60,
        SYS_TYPE: 'entity',
        SYS_TYPE_ENTITY: hrClassEntity.id,
        SYS_TYPE_ENTITY_REF: true,
        SYS_FLOOR_ENTITY_TYPE: 'collection',
        SYS_GENRE: lanePrepareClassGenre.id})
    //}}}

    // Run Prepare{{{
    let runPrepareClassEntity = await createEntityWithOrder(prodWCDomainGenre, "RUN_PREPARE", 1, "上机测序", 90,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_WORKCENTER_PLUGIN_INDEX_VALIDATOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleCode.id,
                attrGPSampleName.id,
                attrGPIndexCode.id,
                attrGPIndexSequence.id,
                attrGPPanelCode.id,
                attrLPCode.id,
            ],
        })
    runPrepareClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
    let runPrepareClassGenre = await createGenre(runPrepareClassEntity)
    let attrRPCode = await createAttribute({
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
    let attrRPInstrumentCode = await createAttribute({
        label: '机器编号',
        SYS_CODE: 'INSTURMENT_CODE',
        SYS_ORDER: 40,
        SYS_TYPE: 'list',
        SYS_TYPE_LIST: 'alane:A,blane:B',
        SYS_GENRE: runPrepareClassGenre.id})
    let attrRPType = await createAttribute({
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
    //}}}

    // Run Result{{{
    let runResultClassEntity = await createEntityWithOrder(prodWCDomainGenre, "RUN_RESULT", 1, "测序结果", 100,
        {
            'SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR': true,
            'SYS_AUXILIARY_ATTRIBUTE_LIST': [
                attrGPSampleCode.id,
                attrGPSampleName.id,
                attrRPCode.id,
                attrRPInstrumentCode.id,
                attrRPType.id,
            ],
        })
    runResultClassEntity['SYS_WORKCENTER_PLUGIN_EXCEL_PROCESSOR'] = true
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

    //Entity({
    //SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'EXTRACTION_PREPARE',
    //SYS_ENTITY_TYPE: 'object',
    //SYS_GENRE: v1CollGenre.id,
    //SYS_CHECKED: true,
    //SYS_ORDER: 10,
    //SYS_SOURCE: sampleExtractClassEntity.id,
    //SYS_DURATION: 3,
    //}).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'EXTRACTION_RESULT',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 10,
        SYS_SOURCE: sampleExtractResultClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    //Entity({
    //SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'SAMPLE_QC',
    //SYS_ENTITY_TYPE: 'object',
    //SYS_GENRE: v1CollGenre.id,
    //SYS_CHECKED: true,
    //SYS_ORDER: 30,
    //SYS_SOURCE: sampleQCReviewClassEntity.id,
    //SYS_DURATION: 2,
    //}).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'LIBRARY_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 20,
        SYS_SOURCE: libraryPrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'LIBRARY_REVIEW',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 30,
        SYS_SOURCE: libraryReviewClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'CAPTURE_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 40,
        SYS_SOURCE: capturePrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'CAPTURE_RESULT',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 50,
        SYS_SOURCE: captureResultClassEntity.id,
        SYS_DURATION: 2,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'POOLING',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: true,
        SYS_ORDER: 60,
        SYS_SOURCE: lanePrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'SEQUENCE_PREPARE',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: false,
        SYS_ORDER: 70,
        SYS_SOURCE: runPrepareClassEntity.id,
        SYS_DURATION: 5,
    }).save()
    Entity({
        SYS_IDENTIFIER: v1CollGenre.SYS_IDENTIFIER + 'SEQUENCE_RESULT',
        SYS_ENTITY_TYPE: 'object',
        SYS_GENRE: v1CollGenre.id,
        SYS_CHECKED: false,
        SYS_ORDER: 80,
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

    console.log(">>> done")

}
