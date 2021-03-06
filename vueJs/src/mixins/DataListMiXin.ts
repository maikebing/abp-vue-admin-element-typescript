import { Component, Vue } from 'vue-property-decorator'
import { PagedResultDto, ListResultDto, PagedAndSortedResultRequestDto } from '@/api/types'
/**
 * 数据列表mixin
 * 复写大部分数据列表事件
 */
@Component
export default class DataListMiXin extends Vue {
  /** 数据列表 */
  public dataList = new Array<any>()
  /** 数据总数 */
  public dataTotal = 0
  /** 是否正在加载数据 */
  public dataLoading = false
  /** 查询过滤器
   *如果继承自分页查询接口的其他过滤类型,需要重写初始化类型
   */
  public dataFilter = new PagedAndSortedResultRequestDto()

  /**
   * 刷新数据
   */
  protected refreshData() {
    this.dataLoading = true
    this.getList(this.dataFilter)
      .then(res => {
        this.dataList = res.items
        this.dataTotal = res.items.length
      })
      .finally(() => {
        this.dataLoading = false
      })
  }

  /**
   * 刷新分页数据
   */
  protected refreshPagedData() {
    this.dataLoading = true
    // 这里还可以处理对于过滤器的变动
    // 例如 abp 框架的skipCount区别于常见的pageNumber
    this.getPagedList(this.dataFilter)
      .then(res => {
        this.dataList = res.items
        this.dataTotal = res.totalCount
      })
      .finally(() => {
        this.dataLoading = false
      })
  }

  /**
   * 重写已执行具体查询数据逻辑
   */
  protected getList(filter: any): Promise<ListResultDto<any>> {
    console.log(filter)
    return this.getEmptyList()
  }

  /** 获取空数据 */
  protected getEmptyList() {
    return new Promise<ListResultDto<any>>((resolve) => {
      return resolve(new ListResultDto<any>())
    })
  }

  /**
   * 重写以执行具体查询分页数据逻辑
   * @param filter 查询过滤器
   */
  protected getPagedList(filter: any): Promise<PagedResultDto<any>> {
    console.log(filter)
    return this.getEmptyPagedList()
  }

  /** 获取空分页数据 */
  protected getEmptyPagedList() {
    return new Promise<PagedResultDto<any>>((resolve) => {
      return resolve(new PagedResultDto<any>())
    })
  }

  /**
   * 排序变更事件
   * @param column 事件列
   */
  protected handleSortChange(column: any) {
    this.dataFilter.sorting = column.prop
  }

  /**
   * 本地化接口
   * @param name 本地化名称
   * @param values 参数
   */
  protected l(name: string, values?: any[] | { [key: string]: any }) {
    return this.$t(name, values).toString()
  }

  /** 还可以添加 eventbus 的通用处理器 */
}
