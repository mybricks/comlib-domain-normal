/** 转化时间 */
import { AnyType } from '../_types';
import { Entity, SelectedField } from '../_types/domain';
import { safeParse } from './util';

export const formatTime = (date, format) => {
	if (date == null) {
		return '';
	}
	const pad = n => n < 10 ? '0' + n : n;
	const year = date.getFullYear(),
		yearShort = year.toString().substring(2),
		month = date.getMonth() + 1,
		monthPad = pad(month),
		dateInMonth = date.getDate(),
		dateInMonthPad = pad(dateInMonth),
		hour = date.getHours(),
		hourPad = pad(hour),
		minute = date.getMinutes(),
		minutePad = pad(minute),
		second = date.getSeconds(),
		secondPad = pad(second);

	return format
		.replace(/yyyy/g, year)
		.replace(/yy/g, yearShort)
		.replace(/MM/g, monthPad)
		.replace(/M/g, month)
		.replace(/DD/g, dateInMonthPad)
		.replace(/D/g, dateInMonth)
		.replace(/HH/g, hourPad)
		.replace(/H/g, hour)
		.replace(/mm/g, minutePad)
		.replace(/m/g, minute)
		.replace(/ss/g, secondPad)
		.replace(/s/g, second);
};

export const spliceDataFormat = (fields: SelectedField[], entities: Entity[], rows: AnyType[]) => {
	/** 实体 Map */
	const entityMap = {};
	entities.forEach(e => entityMap[e.id] = e);
	const needFormatPaths: AnyType[] = [];
	fields.forEach(field => {
		const nowEntity = entities.find(e => e.id === field.entityId);
		if (!nowEntity) {
			return;
		}
		const curField = nowEntity.fieldAry.find(f => f.id === field.fieldId);

		if (!curField) {
			return;
		}
		const showFormat = curField.bizType === 'datetime' ? curField.showFormat : (['enum', 'json'].includes(curField.bizType) ? 'JSON' : undefined);
		if (showFormat) {
			needFormatPaths.push([...field.fromPath.map(f => ({ key: f.fieldName })), { key: curField.name, showFormat }]);
		}
	});
	const deepFormat = (item, path) => {
		if (!path.length || !item) { return; }
		const key = path[0].key;
		if (path.length === 1) {
			if (Array.isArray(item)) {
				item.forEach(i => {
					if (path[0].showFormat === 'JSON') {
						try {
							i[key] = i[key] ? safeParse(i[key], i[key]) : i[key];
						} catch (e) {}
					} else {
						i['_' + key] = i[key];
						i[key] = i[key] && path[0].showFormat ? formatTime(new Date(i[key]), path[0].showFormat) : null;
					}
				});
			} else {
				if (path[0].showFormat === 'JSON') {
					try {
						item[key] = item[key] ? safeParse(item[key], item[key]) : item[key];
					} catch (e) {}
				} else {
					item['_' + key] = item[key];
					item[key] = item[key] && path[0].showFormat ? formatTime(new Date(item[key]), path[0].showFormat) : null;
				}
			}

			return ;
		}

		if (Array.isArray(item)) {
			item.forEach(i => {
				deepFormat(i, path.slice(1));
			});
		} else {
			deepFormat(item[key], path.slice(1));
		}
	};

	return Array.from(rows || []).map(item => {
		needFormatPaths.forEach(path => {
			deepFormat(item, path);
		});

		return item;
	});
};
