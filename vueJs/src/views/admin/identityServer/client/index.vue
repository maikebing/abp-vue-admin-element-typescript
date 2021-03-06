<template>
  <div class="app-container">
    <div class="filter-container">
      <label
        class="radio-label"
        style="padding-left:10px;"
      >{{ $t('queryFilter') }}</label>
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
        {{ $t('searchList') }}
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        :disabled="!checkPermission(['IdentityServer.Clients.Create'])"
        @click="handleShowCreateClientForm()"
      >
        {{ $t('identityServer.createClient') }}
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
        :label="$t('identityServer.clientId')"
        prop="clientId"
        sortable
        width="150px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.clientId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.clientName')"
        prop="clientName"
        sortable
        width="200px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.clientName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.clientStatus')"
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
        :label="$t('identityServer.identityTokenLifetime')"
        prop="identityTokenLifetime"
        width="170px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.identityTokenLifetime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.accessTokenLifetime')"
        prop="accessTokenLifetime"
        width="170px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.accessTokenLifetime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.authorizationCodeLifetime')"
        prop="authorizationCodeLifetime"
        width="170px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.authorizationCodeLifetime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.deviceCodeLifetime')"
        prop="deviceCodeLifetime"
        width="170px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.deviceCodeLifetime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.absoluteRefreshTokenLifetime')"
        prop="absoluteRefreshTokenLifetime"
        width="180px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.absoluteRefreshTokenLifetime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.slidingRefreshTokenLifetime')"
        prop="slidingRefreshTokenLifetime"
        width="180px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.slidingRefreshTokenLifetime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('identityServer.clientClaimsPrefix')"
        prop="clientClaimsPrefix"
        width="120px"
        align="center"
      >
        <template slot-scope="{row}">
          <span>{{ row.clientClaimsPrefix }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('operaActions')"
        align="center"
        width="250px"
        fixed="right"
      >
        <template slot-scope="{row}">
          <el-button
            :disabled="!checkPermission(['IdentityServer.Clients.Update'])"
            size="mini"
            type="primary"
            @click="handleShowEditClientForm(row)"
          >
            {{ $t('identityServer.updateClient') }}
          </el-button>
          <el-dropdown
            class="options"
            @command="handleCommand"
          >
            <el-button
              v-permission="['IdentityServer.Clients']"
              size="mini"
              type="info"
            >
              {{ $t('identityServer.otherOpera') }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="{key: 'clone', row}"
                :disabled="!checkPermission(['IdentityServer.Clients.Clone'])"
              >
                {{ $t('identityServer.cloneClint') }}
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :command="{key: 'claim', row}"
                :disabled="!checkPermission(['IdentityServer.Clients.Claims'])"
              >
                {{ $t('identityServer.clientClaim') }}
              </el-dropdown-item>
              <el-dropdown-item
                :command="{key: 'property', row}"
                :disabled="!checkPermission(['IdentityServer.Clients.Properties'])"
              >
                {{ $t('identityServer.clientProperty') }}
              </el-dropdown-item>
              <el-dropdown-item
                :command="{key: 'secret', row}"
                :disabled="!checkPermission(['IdentityServer.Clients.Secrets'])"
              >
                {{ $t('identityServer.clientSecret') }}
              </el-dropdown-item>
              <el-dropdown-item
                :command="{key: 'permissions', row}"
                :disabled="!checkPermission(['IdentityServer.Clients.ManagePermissions'])"
              >
                {{ $t('identityServer.clientPermission') }}
              </el-dropdown-item>
              <el-dropdown-item
                divided
                :command="{key: 'delete', row}"
                :disabled="!checkPermission(['IdentityServer.Clients.Delete'])"
              >
                {{ $t('identityServer.deleteClient') }}
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
      :visible.sync="showCreateClientDialog"
      :title="$t('identityServer.createClient')"
      custom-class="modal-form"
      :show-close="false"
      @closed="handleClientCreateFormClosed"
    >
      <ClientCreateForm
        ref="formCreateClient"
        @closed="handleClientCreateFormClosed"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showCloneClientDialog"
      :title="$t('identityServer.cloneClint')"
      custom-class="modal-form"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <ClientCloneForm
        ref="formCloneClient"
        :client-id="editClient.id"
        @closed="handleClientCloneFormClosed"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditClientDialog"
      :title="editClientTitle"
      custom-class="modal-form"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <ClientEditForm
        :client-id="editClient.id"
        @closed="handleClientEditFormClosed"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditClientSecretDialog"
      :title="$t('identityServer.clientSecret')"
      custom-class="modal-form"
      :show-close="false"
      @closed="handleClientSecretEditFormClosed"
    >
      <ClientSecretEditForm
        ref="formClientSecret"
        :client-id="editClient.id"
        :client-secrets="editClient.clientSecrets"
        @clientSecretChanged="refreshPagedData"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditClientClaimDialog"
      :title="$t('identityServer.clientClaim')"
      custom-class="modal-form"
      :show-close="false"
      @closed="handleClientClaimEditFormClosed"
      @clientClaimChanged="refreshPagedData"
    >
      <ClientClaimEditForm
        ref="formClientClaim"
        :client-id="editClient.id"
        :client-claims="editClient.claims"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditClientPropertyDialog"
      :title="$t('identityServer.clientProperty')"
      custom-class="modal-form"
      :show-close="false"
      @closed="handleClientPropertyEditFormClosed"
      @clientPropertyChanged="refreshPagedData"
    >
      <ClientPropertyEditForm
        ref="formClientProperty"
        :client-id="editClient.id"
        :client-properties="editClient.properties"
      />
    </el-dialog>

    <el-dialog
      v-el-draggable-dialog
      width="800px"
      :visible.sync="showEditClientPermissionDialog"
      :title="$t('identityServer.clientPermission')"
      custom-class="modal-form"
      :show-close="false"
      @closed="handleClientPermissionEditFormClosed"
    >
      <ClientPermissionEditForm
        ref="formClientPermission"
        :client-id="editClient.clientId"
        @closed="handleClientPermissionEditFormClosed"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { checkPermission } from '@/utils/permission'
import DataListMiXin from '@/mixins/DataListMiXin'
import Component, { mixins } from 'vue-class-component'
import Pagination from '@/components/Pagination/index.vue'
import ClientEditForm from './components/ClientEditForm.vue'
import ClientCloneForm from './components/ClientCloneForm.vue'
import ClientCreateForm from './components/ClientCreateForm.vue'
import ClientSecretEditForm from './components/ClientSecretEditForm.vue'
import ClientClaimEditForm from './components/ClientClaimEditForm.vue'
import ClientPropertyEditForm from './components/ClientPropertyEditForm.vue'
import ClientPermissionEditForm from './components/ClientPermissionEditForm.vue'
import ClientService, { Client, ClientGetByPaged } from '@/api/clients'

@Component({
  name: 'IdentityServerClient',
  components: {
    Pagination,
    ClientEditForm,
    ClientCloneForm,
    ClientCreateForm,
    ClientClaimEditForm,
    ClientSecretEditForm,
    ClientPropertyEditForm,
    ClientPermissionEditForm
  },
  methods: {
    checkPermission,
    local(name: string) {
      return this.$t(name)
    }
  },
  filters: {
    statusFilter(status: boolean) {
      if (status) {
        return 'success'
      }
      return 'warning'
    }
  }
})
export default class extends mixins(DataListMiXin) {
  private editClient = Client.empty()
  private editClientTitle = ''

  private showEditClientDialog = false
  private showCloneClientDialog = false
  private showCreateClientDialog = false
  private showEditClientSecretDialog = false
  private showEditClientClaimDialog = false
  private showEditClientPropertyDialog = false
  private showEditClientPermissionDialog = false

  public dataFilter = new ClientGetByPaged()

  mounted() {
    this.refreshPagedData()
  }

  protected getPagedList(filter: any) {
    return ClientService.getClients(filter)
  }

  private handleShowCreateClientForm() {
    this.editClient = Client.empty()
    this.editClientTitle = this.l('identityServer.createClient')
    this.showCreateClientDialog = true
  }

  private handleShowEditClientForm(client: Client) {
    this.editClient = client
    this.editClientTitle = this.l('identityServer.updateClientByName', { name: this.editClient.clientName })
    this.showEditClientDialog = true
  }

  private handleClientCreateFormClosed(changed: boolean) {
    this.editClientTitle = ''
    this.editClient = Client.empty()
    this.showCreateClientDialog = false
    const frmClient = this.$refs.formCreateClient as ClientCreateForm
    frmClient.resetFields()
    if (changed) {
      this.refreshPagedData()
    }
  }

  private handleClientCloneFormClosed(changed: boolean) {
    this.editClientTitle = ''
    this.editClient = Client.empty()
    this.showCloneClientDialog = false
    const frmClient = this.$refs.formCloneClient as ClientCloneForm
    frmClient.resetFields()
    if (changed) {
      this.refreshPagedData()
    }
  }

  private handleClientEditFormClosed(changed: boolean) {
    this.editClientTitle = ''
    this.editClient = Client.empty()
    this.showEditClientDialog = false
    if (changed) {
      this.refreshPagedData()
    }
  }

  private handleClientSecretEditFormClosed() {
    this.showEditClientSecretDialog = false
    const frmClientSecret = this.$refs.formClientSecret as ClientSecretEditForm
    frmClientSecret.resetFields()
  }

  private handleClientClaimEditFormClosed() {
    this.showEditClientClaimDialog = false
    const frmClientClaim = this.$refs.formClientClaim as ClientClaimEditForm
    frmClientClaim.resetFields()
  }

  private handleClientPropertyEditFormClosed() {
    this.showEditClientPropertyDialog = false
    const frmClientProperty = this.$refs.formClientProperty as ClientPropertyEditForm
    frmClientProperty.resetFields()
  }

  private handleClientPermissionEditFormClosed() {
    this.editClient = Client.empty()
    this.showEditClientPermissionDialog = false
  }

  private handleDeleteClient(id: string, clientId: string) {
    this.$confirm(this.l('identityServer.deleteClientById', { id: clientId }),
      this.l('identityServer.deleteClient'), {
        callback: (action) => {
          if (action === 'confirm') {
            ClientService.deleteClient(id).then(() => {
              this.$message.success(this.l('identityServer.deleteClientSuccess', { id: clientId }))
              this.refreshPagedData()
            })
          }
        }
      })
  }

  private handleCommand(command: {key: string, row: Client}) {
    this.editClient = command.row
    switch (command.key) {
      case 'clone' :
        this.showCloneClientDialog = true
        break
      case 'secret' :
        this.showEditClientSecretDialog = true
        break
      case 'claim' :
        this.showEditClientClaimDialog = true
        break
      case 'property':
        this.showEditClientPropertyDialog = true
        break
      case 'permissions':
        this.showEditClientPermissionDialog = true
        break
      case 'delete' :
        this.handleDeleteClient(command.row.id, command.row.clientId)
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
