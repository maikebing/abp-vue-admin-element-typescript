<template>
  <div class="app-container">
    <div class="filter-container">
      <label
        class="radio-label"
        style="padding-left:10px;"
      >{{ $t('global.queryFilter') }}</label>
      <el-input
        v-model="dataFilter.filter"
        :placeholder="$t('filterString')"
        style="width: 250px;margin-left: 10px;"
        class="filter-item"
      />
      <el-button
        class="filter-item"
        style="margin-left: 10px; text-alignt"
        type="primary"
        @click="refreshPagedData"
      >
        {{ $t('global.searchList') }}
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        :disabled="!checkPermission(['IdentityServer.IdentityResources.Create'])"
        @click="handleShowEditIdentityResourceForm"
      >
        {{ $t('identityServer.createIdentityResource') }}
      </el-button>
    </div>

    <el-table
      v-loading="dataLoading"
      row-key="id"
      :data="dataList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="handleSortChange"
    >
      <el-table-column
        :label="$t('global.name')"
        prop="name"
        sortable
        width="150px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('global.displayName')"
        prop="displayName"
        sortable
        width="200px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.displayName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('global.status')"
        prop="enabled"
        sortable
        width="140px"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.enabled | statusFilter">
            {{ formatStatusText(row.enabled) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('global.description')"
        prop="description"
        sortable
        width="200px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('global.creationTime')"
        prop="creationTime"
        width="170px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>
            <el-tag>
              {{ row.creationTime | datetimeFilter }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('global.lastModificationTime')"
        prop="lastModificationTime"
        width="170px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>
            <el-tag type="warning">
              {{ row.lastModificationTime | datetimeFilter }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('global.operaActions')"
        align="center"
        width="250px"
      >
        <template slot-scope="{row}">
          <el-button
            :disabled="!checkPermission(['IdentityServer.IdentityResources.Update'])"
            size="mini"
            type="primary"
            @click="handleShowEditIdentityResourceForm(row)"
          >
            {{ $t('identityServer.updateIdentityResource') }}
          </el-button>
          <el-dropdown
            class="options"
            @command="handleCommand"
          >
            <el-button
              v-permission="['IdentityServer.IdentityResources']"
              size="mini"
              type="info"
            >
              {{ $t('global.otherOpera') }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="{key: 'property', row}"
                :disabled="!checkPermission(['IdentityServer.IdentityResources.Properties'])"
              >
                {{ $t('identityServer.identityResourceProperties') }}
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :command="{key: 'delete', row}"
                :disabled="!checkPermission(['IdentityServer.IdentityResources.Delete'])"
              >
                {{ $t('identityServer.deleteIdentityResource') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-show="dataTotal>0"
      :total="dataTotal"
      :page.sync="dataFilter.skipCount"
      :limit.sync="dataFilter.maxResultCount"
      @pagination="refreshPagedData"
      @sort-change="handleSortChange"
    />

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditIdentityResourceDialog"
      :title="editIdentityResourceTitle"
      custom-class="modal-form"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @closed="handleIdentityResourceEditFormClosed"
    >
      <IdentityResourceCreateOrEditForm
        ref="formIdentityResource"
        :identity-resource-id="editIdentityResource.id"
        @closed="handleIdentityResourceEditFormClosed"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditIdentityPropertyDialog"
      :title="$t('identityServer.identityResourceProperties')"
      custom-class="modal-form"
      :show-close="false"
      @closed="handleIdentityPropertyEditFormClosed"
    >
      <IdentityPropertyEditForm
        ref="formIdentityProperty"
        :identity-resource="editIdentityResource"
        @closed="handleIdentityPropertyEditFormClosed"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { dateFormat } from '@/utils/index'
import { checkPermission } from '@/utils/permission'
import DataListMiXin from '@/mixins/DataListMiXin'
import Component, { mixins } from 'vue-class-component'
import Pagination from '@/components/Pagination/index.vue'
import IdentityPropertyEditForm from './components/IdentityResourcePropertyEditForm.vue'
import IdentityResourceCreateOrEditForm from './components/IdentityResourceCreateOrEditForm.vue'
import IdentityResourceService, { IdentityResource, IdentityResourceGetByPaged } from '@/api/identityresources'

@Component({
  name: 'IdentityServerIdentityResource',
  components: {
    Pagination,
    IdentityPropertyEditForm,
    IdentityResourceCreateOrEditForm
  },
  methods: {
    checkPermission
  },
  filters: {
    statusFilter(status: boolean) {
      if (status) {
        return 'success'
      }
      return 'warning'
    },
    datetimeFilter(val: string) {
      const date = new Date(val)
      return dateFormat(date, 'YYYY-mm-dd HH:MM')
    }
  }
})
export default class extends mixins(DataListMiXin) {
  private editIdentityResource = IdentityResource.empty()
  private editIdentityResourceTitle = ''

  private showEditIdentityPropertyDialog = false
  private showEditIdentityResourceDialog = false

  public dataFilter = new IdentityResourceGetByPaged()

  mounted() {
    this.refreshPagedData()
  }

  protected getPagedList(filter: any) {
    return IdentityResourceService.getIdentityResources(filter)
  }

  private handleShowEditIdentityResourceForm(resource: IdentityResource) {
    this.editIdentityResource = IdentityResource.empty()
    if (resource) {
      this.editIdentityResource = resource
      this.editIdentityResourceTitle = this.l('identityServer.updateIdentityResourceByName', { name: this.editIdentityResource.name })
    } else {
      this.editIdentityResourceTitle = this.l('identityServer.createIdentityResource')
    }
    this.showEditIdentityResourceDialog = true
  }

  private handleIdentityResourceEditFormClosed(changed: boolean) {
    this.reset(changed)
  }

  private handleIdentityPropertyEditFormClosed(changed: boolean) {
    this.reset(changed)
  }

  private handleDeleteIdentityResource(id: string, name: string) {
    this.$confirm(this.l('identityServer.deleteIdentityResourceByName', { name: name }),
      this.l('identityServer.deleteIdentityResource'), {
        callback: (action) => {
          if (action === 'confirm') {
            IdentityResourceService.deleteIdentityResource(id).then(() => {
              this.$message.success(this.l('identityServer.deleteIdentityResourceSuccess', { name: name }))
              this.refreshPagedData()
            })
          }
        }
      })
  }

  private handleCommand(command: {key: string, row: IdentityResource}) {
    this.editIdentityResource = command.row
    switch (command.key) {
      case 'property' :
        this.showEditIdentityPropertyDialog = true
        break
      case 'delete' :
        this.handleDeleteIdentityResource(command.row.id, command.row.name)
        break
      default: break
    }
  }

  private formatStatusText(status: boolean) {
    let statusText = ''
    if (status) {
      statusText = this.l('enabled')
    } else {
      statusText = this.l('disbled')
    }
    return statusText
  }

  private reset(changed: boolean) {
    this.editIdentityResourceTitle = ''
    this.editIdentityResource = IdentityResource.empty()
    this.showEditIdentityResourceDialog = false
    this.showEditIdentityPropertyDialog = false
    if (changed) {
      this.refreshPagedData()
    }
  }
}
</script>

<style lang="scss" scoped>
.roleItem {
  width: 40px;
}
.options {
  vertical-align: top;
  margin-left: 20px;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
