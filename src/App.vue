<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { TableColumnData } from '@arco-design/web-vue'
import { exportExcelFile, convertKeys } from './utils/excel';

const columns: TableColumnData[] =[
  {
    title: '序号',
    dataIndex: 'rowIndex',
    slotName: 'rowIndex',
    width: 80,
    align: 'center'
  },{
    title: '商品ID',
    dataIndex: 'goodsId',
    width: 160,
    align: 'center'
  },
  {
    title: '商品名称',
    dataIndex: 'goodsName',
    width: 200,
    align: 'center'
  },
    {
    title: '商品价格',
    dataIndex: 'goodsPrice',
    width: 100,
    align: 'center'
  },
  {
    title: '商品销量',
    dataIndex: 'goodsSales',
    width: 100,
    align: 'center'
  },
  {
    title: '店铺ID',
    dataIndex: 'mallId',
    width: 140,
    align: 'center'
  },
  {
    title: '店铺名称',
    dataIndex: 'mallName',
    width: 200,
    align: 'center'
  },
   {
    title: '店铺销量',
    dataIndex: 'mallSales',
    width: 180,
    align: 'center'
  },
   {
    title: '店铺关注',
    dataIndex: 'mallFav',
    width: 180,
    align: 'center'
  },
  
]

const dataList = ref<any[]>([])

const num = ref(10)
const count = ref(1)
const isStart = ref(false)
const loading = ref(false)


function createReq() {
  // const base = 'https://pub-api.vip'
  const base = 'http://194.169.55.63:8081'
	return new Promise((resolve, reject) => {
		fetch(base+'/p/gMall', {
			method: 'POST',
		})
			.then(async (rsp) => {
				const ids = (await rsp.text()).split('|')
				const formData = new FormData()
				formData.append('g', ids[0])
				formData.append('m', ids[1])
				fetch(base+'/p/pGoods', {
					method: 'POST',
					body: formData,
				})
					.then(async (resp) => {
						const result = await resp.json()
						resolve(result)
					})
					.catch((err) => {
						reject(err)
					})
			})
			.catch((e) => {
				reject(e)
			})
	})
}

function startLoop() {
  if (!isStart.value) return
  loading.value = true
  let list = []
  for (let i = 0; i < num.value; i++) {
    list.push(createReq())
  }
  // console.time('loop')
  Promise.allSettled(list).then((results => {
    // console.log(results);
    const list = results.filter(el => el.status === 'fulfilled')
    const values = list.map((el: any) => el.value)
    dataList.value =values.flat().concat(dataList.value) 
    count.value += 1
    loading.value = false
    // console.timeEnd('loop')
    setTimeout(() => {
      startLoop()
    } ,1000)
    
  }))

  // count.value += 1
  // startLoop()
}

function onStart() {
  if (isStart.value) return
  count.value = 0
  isStart.value = true
  startLoop()
}

function onStop() {
  isStart.value = false
 
}

onBeforeUnmount(() => {
  onStop()
})



function exportExcel() {
 
  const KeyMap = {
    'goodsId': '商品ID',
    'goodsName': '商品名称',
    'goodsPrice': '商品价格',
    'goodsSales': '商品销量',
    'mallId': '店铺ID',
    'mallName': '店铺名称',
    'mallSales': '店铺销量',
    'mallFav': '店铺关注',
    'nearGroupNum': 'nearGroupNum',
    'catId': 'catId',
    'catId1': 'catId1',
    'catId2': 'catId2',
    'catId3': 'catId3',
    'catId4': 'catId4',
   
  }

  const array = convertKeys(dataList.value, KeyMap)

  exportExcelFile(array)
  
}

function removeDuplicate() {
  const res = new Map();
  const uniId = 'goodsId'
  dataList.value = dataList.value.filter((item) => !res.has(item[uniId]) && res.set(item[uniId], 1));
}

</script>

<template>
  <div class="container">
 
    <div class="tool">
      <a-input-number v-model="num"  mode="button" :min="1" :disabled="isStart" style="width: 180px; " />
      <a-button v-if="isStart || loading" class="btn" type="primary" :loading="loading" disabled>{{ loading ? `正在执行第（${count}）次` : `已执行（${count}）次`}}</a-button>
      <a-button v-if="!isStart && !loading" class="btn" type="primary" @click="onStart">开始</a-button>
      
      <a-button class="btn" type="primary" status="danger" @click="onStop" :disabled="!isStart">停止</a-button>
      <a-button class="btn" type="primary" status="success" @click="exportExcel">导出数据（{{ dataList.length }}）</a-button>
      <a-button class="btn" type="primary" status="warning"   @click="removeDuplicate">数据去重</a-button>
    </div>

    <a-table 
    :loading="loading"
    :columns="columns" 
    :data="dataList" 
    :virtual-list-props="{height:700}"
    scrollbar
    :scroll="{y: 700}"
    :pagination="false" >

    <template #rowIndex="{rowIndex}">{{ rowIndex + 1 }}</template>
    </a-table>

    
  </div>
</template>

<style scoped>
.tool {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.btn {
  margin-left: 20px;
}
</style>
