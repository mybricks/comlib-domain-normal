import {Entity, Field, SelectedField} from '../_types/domain';
import {FieldBizType} from "../_constants/field";

const baseValidateField = (curEntity: Entity, originField: Field, nowField?: Field) => {
	if (!nowField) {
		return `实体【${curEntity.name}】中字段存在变更，原【${originField.name}】字段已被删除`;
	}
	
	if (originField.name !== nowField.name) {
		return `实体【${curEntity.name}】中字段名存在变更，由【${originField.name}】变更为【${nowField.name}】`;
	}
	
	if (originField.bizType !== nowField.bizType || (originField.bizType === nowField.bizType && originField.dbType !== nowField.dbType)) {
		return `实体【${curEntity.name}】中字段【${originField.name}】类型存在变更，由【${originField.typeLabel}】变更为【${nowField.typeLabel}】`;
	}
}
const getFieldIdsByConditions = (conditions, fieldIds) => {
	conditions.forEach(con => {
		if (con.conditions) {
			getFieldIdsByConditions(con.conditions, fieldIds);
		} else {
			con.fieldId && fieldIds.push(con.fieldId);
		}
	});
};

/** 校验删除组件数据是否需要用户变更 */
export const validateEntityForDelete = (entities: Entity[] = [], newEntity: any, conditions = []) => {
	const curEntity = entities.find(e => e.selected);
	
	if (newEntity && curEntity && curEntity.id === newEntity.id) {
		const fieldIds: string[] = [];
		getFieldIdsByConditions([conditions], fieldIds);
		
		if (curEntity.name !== newEntity.name) {
			return `实体名存在变更，由【${curEntity.name}】变更为【${newEntity.name}】`;
		}
		
		const willAffectedFields = curEntity.fieldAry.filter(f => fieldIds.includes(f.id));
		
		for (let idx = 0; idx < willAffectedFields.length; idx++) {
			const originField = willAffectedFields[idx];
			const nowField = newEntity.fieldAry.find(f => f.id === originField.id);
			
			const error = baseValidateField(curEntity, originField, nowField);
			
			if (error) {
				return error;
			}
		}
	}
};

/** 校验实体是否存在变更 */
export const validateEntity = (entities: Entity[], newEntity: Entity, options?: any) => {
	const curEntity = entities.find(e => e.selected);
	
	if (curEntity && newEntity && curEntity.id === newEntity.id) {
		let willAffectedFields = curEntity.fieldAry;
		
		/** 更新数据组件只判断所使用到的字段 */
		if (options) {
			const { conAry = [], conditions = [] } = options;
			const fieldIds: string[] = [];
			const fieldNames: string[] = conAry.map(con => con.to.slice(1));
			getFieldIdsByConditions([conditions], fieldIds);
			
			willAffectedFields = curEntity.fieldAry.filter(f => fieldIds.includes(f.id) || fieldNames.includes(f.name));
		}
		
		if (curEntity.name !== newEntity.name) {
			return `实体名存在变更，由【${curEntity.name}】变更为【${newEntity.name}】`;
		}
		
		for (let idx = 0; idx < willAffectedFields.length; idx++) {
			const originField = willAffectedFields[idx];
			const nowField = newEntity.fieldAry.find(f => f.id === originField.id);
			
			const error = baseValidateField(curEntity, originField, nowField);
			
			if (error || !nowField) {
				return error;
			}
			
			if (originField.defaultValueWhenCreate !== nowField.defaultValueWhenCreate) {
				return `实体【${curEntity.name}】中字段【${originField.name}】默认值存在变更`;
			}
			
			if (
				originField.bizType === FieldBizType.ENUM
				&& originField.enumValues?.join(',') !== nowField.enumValues?.join(',')
			) {
				return `实体【${curEntity.name}】中字段【${originField.name}】枚举选项存在变更`;
			}
		}
	}
};

/** 校验实体是否存在变更 */
export const depValidateEntity = (params: {
	entities: Entity[];
	newEntity: Entity;
	fields: SelectedField[];
	conditions: any[];
	orders: SelectedField[];
}) => {
	const { entities, newEntity, fields = [], conditions, orders = [] } = params;
	const curEntity = entities.find(e => e.selected);
	
	if (!curEntity || !newEntity) {
		return;
	}
	
	const originEntity = entities.find(e => e.id === newEntity.id);
	
	if (originEntity) {
		const entityMap: Record<string, SelectedField[]> = {};
		let whereFields: any[] = [];
		const getFieldIdsByConditions = (conditions) => {
			conditions.forEach(con => {
				if (con.conditions) {
					getFieldIdsByConditions(con.conditions);
				} else {
					con.fieldId && whereFields.push(con);
				}
			});
		};
		getFieldIdsByConditions([conditions]);
		
		[...whereFields, ...fields, ...orders].forEach(f => {
			if (!entityMap[f.entityId]) {
				entityMap[f.entityId] = [f];
			} else {
				entityMap[f.entityId].push(f);
			}
		});
		const usedFieldIds = entityMap[newEntity.id]?.map(f => f.fieldId) || [];
		
		if (usedFieldIds.length) {
			const willAffectedFields = originEntity.fieldAry.filter(f => usedFieldIds.includes(f.id));
			
			if (originEntity.name !== newEntity.name) {
				return `实体名存在变更，由【${originEntity.name}】变更为【${newEntity.name}】`;
			}
			
			for (let idx = 0; idx < willAffectedFields.length; idx++) {
				const originField = willAffectedFields[idx];
				const nowField = newEntity.fieldAry.find(f => f.id === originField.id);
				
				const error = baseValidateField(originEntity, originField, nowField);
				
				if (error || !nowField) {
					return error;
				}
				
				if (originField.bizType === FieldBizType.RELATION && originField.relationEntityId !== nowField.relationEntityId) {
					return `实体【${originEntity.name}】中字段【${originField.name}】所关联的实体存在变更`;
				}
				if (originField.showFormat !== nowField.showFormat) {
					return `实体【${originEntity.name}】中字段【${originField.name}】数据格式化方式存在变更`;
				}
				
				if (originField.mapping && !nowField.mapping) {
					return `实体【${originEntity.name}】中字段【${originField.name}】所映射数据存在变更`;
				}
				
				if (originField.mapping && nowField.mapping) {
					if (
						originField.mapping.condition !== nowField.mapping.condition
						|| originField.mapping.fieldJoiner !== nowField.mapping.fieldJoiner
						|| originField.mapping.type !== nowField.mapping.type
						|| originField.mapping.entity?.id !== nowField.mapping.entity?.id
						|| originField.mapping.entity?.name !== nowField.mapping.entity?.name
						|| originField.mapping.entity?.fieldAry.length !== nowField.mapping.entity?.fieldAry.length
					) {
						return `实体【${originEntity.name}】中字段【${originField.name}】所映射数据存在变更`;
					}
					
					const originMappingFieldIds = originField.mapping.entity?.fieldAry.map(f => f.id).sort().join(',');
					const newMappingFieldIds = nowField.mapping.entity?.fieldAry.map(f => f.id).sort().join(',');
					const originMappingFieldNames = originField.mapping.entity?.fieldAry.map(f => f.name).sort().join(',');
					const newMappingFieldNames = nowField.mapping.entity?.fieldAry.map(f => f.name).sort().join(',');
					
					if (originMappingFieldIds !== newMappingFieldIds || originMappingFieldNames !== newMappingFieldNames) {
						return `实体【${originEntity.name}】中字段【${originField.name}】所映射数据存在变更`;
					}
				}
			}
		}
	}
};
