/*
 * @Author: zdd
 * @Date: 2023-05-19 13:31:16
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 14:12:24
 * @FilePath: /vg-cli/example/mock/project.ts
 * @Description:
 */

const listRes = {
  code: 1,
  data: [
    {
      id: 6527,
      companyId: 235,
      district: '杭州',
      districtId: 5,
      projectNo: '2023-6527',
      lesseeCompanyId: 2008,
      status: 'created',
      lat: 30.25713,
      lng: 120.227677,
      location: '浙江省杭州市上城区剧院路',
    },
    {
      id: 6525,
      companyId: 235,
      district: '杭州',
      districtId: 5,
      projectNo: '2023-6525',
      lesseeCompanyId: 2260,
      status: 'created',
      lat: 30.329048,
      lng: 120.106124,
      location: '浙江省杭州市拱墅区丰庆路261-9号',
    },
  ],
  msg: 'success',
  total: 376,
};

const detailRes = {
  code: 1,
  data: {
    project: {
      id: 6527,
      companyId: 235,
      district: '杭州',
      districtId: 5,
      projectNo: '2023-6527',
      lesseeCompanyId: 2008,
      status: 'created',
      lat: 30.25713,
      lng: 120.227677,
      location: '浙江省杭州市上城区剧院路',
    },
    scheduleDevices: [],
    documents: [],
    schedules: [],
    contracts: [
      {
        projectId: 6527,
        isDelete: false,
        createAt: '0001-01-01T00:00:00Z',
      },
    ],
    dailyWorks: [],
    returnVisits: [],
  },
  msg: 'success',
};

const managerRes = {
  code: 1,
  data: [
    {
      id: 491,
      companyId: 235,
      realName: '9111',
      mobile: '91112345678',
      pass: '4bf346a517a244b6dc76cc34bbfce954',
      roles: 'warehouse_manager,finance_manager',
      inviteCode: '',
      eulaAgreed: true,
      areaId: 5,
      isSuper: false,
      createAt: '2023-04-07T10:25:29.01+08:00',
    },
    {
      id: 635,
      companyId: 235,
      realName: 'A',
      mobile: '17367065398',
      pass: 'f8db9cca4e70e1b0e7870bec9a794174',
      roles: 'warehouse_manager',
      inviteCode: '',
      eulaAgreed: false,
      areaId: 1,
      isSuper: false,
      createAt: '2023-04-11T15:32:24.35+08:00',
    },
    {
      id: 724,
      companyId: 235,
      realName: '啊啊',
      mobile: '91191',
      pass: '63dc2defd0aa53fc33ca2ff983232f15',
      roles: '',
      inviteCode: '',
      eulaAgreed: false,
      areaId: 5,
      isSuper: false,
      createAt: '2022-11-10T16:37:09.435+08:00',
    },
  ],
  msg: 'success',
  total: 8,
};

export default {
  'GET /project/list': listRes,
  'GET /project/detail': detailRes,
  'GET /project/manager/list': managerRes,
};
