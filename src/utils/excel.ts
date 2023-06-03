import * as xlsx from 'xlsx'
import type { WorkBook } from 'xlsx'

/**
 * 转换 key
 * @param excelData 原数json列表据
 * @param keysMap   转换keyMap
 */
export function convertKeys<Raw = any, Target = any>(
	excelData: Raw[],
	keysMap: Record<string, string>
): Target[] {
	return excelData.map((excelItem: any) => {
		return Object.entries(excelItem).reduce((prev: any, curt) => {
			const [curtKey, curtValue] = curt

			// 更新 key
			const mappedKey = keysMap[curtKey]
			if (mappedKey) {
				prev[mappedKey] = curtValue
			} else {
				prev[curtKey] = curtValue
			}

			return prev
		}, {})
	})
}

/**
 * 导出 excel 文件
 * @param array JSON 数组
 * @param sheetName 第一张表名
 * @param fileName 文件名
 */
export function exportExcelFile(
	array: any[],
	sheetName = '表1',
	fileName = Date.now() + '.xlsx'
) {
	const jsonWorkSheet = xlsx.utils.json_to_sheet(array)
	const workBook: WorkBook = {
		SheetNames: [sheetName],
		Sheets: {
			[sheetName]: jsonWorkSheet,
		},
	}
	return xlsx.writeFile(workBook, fileName)
}
