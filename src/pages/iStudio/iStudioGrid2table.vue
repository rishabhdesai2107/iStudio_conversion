<template>
  <div style="position: absolute; height: 45%">
    <div class="q-pa-sm">
      <q-table
        class="my-sticky-dynamic"
        :style="
          $q.platform.is.ios || $q.screen.lt.sm
            ? 'height: 80vh;'
            : 'height: 83vh;'
        "
        row-key="_id"
        hide-bottom
        :id="uuid"
        :title="title"
        :grid="$q.platform.is.mobile ? true : mode === 'grid'"
        :data="getFilteredValuesData"
        :columns="columns"
        :visible-columns="visibleColumns"
        :class="classes"
        :separator="separator1"
        :dense="dense"
        :dark="dark"
        :flat="flat"
        :bordered="bordered"
        :square="square"
        :selection="selection_prop"
        v-model:selected="selected_prop"
        :filter="filter"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :virtual-scroll-sticky-start="10"
        :pagination="pagination"
        :rows-per-page-options="[0]"
        :loading="loader"
        @virtual-scroll="virtualScroll"
      >
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props" style="height: 1vh">
            <q-th auto-width v-if="selection_prop != 'none'">
              <q-checkbox
                v-if="props.multipleSelect"
                v-model="props.selected"
                indeterminate-value="some"
              />
            </q-th>

            <q-th
              :props="props"
              @hover.stop
              v-for="col in columns"
              :key="col.name"
            >
              <div class="row inline">
                <div class="column">
                  <span class>{{ col.label }}</span>
                </div>
                <div class="column">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="fa fa-filter"
                    class="q-ml-xs"
                    @click.stop
                    v-if="header_filter"
                  >
                    <q-icon
                      name="fas fa-asterisk"
                      color="red"
                      style="font-size: 7px"
                      v-if="column_options_selected[col.field].length > 0"
                    />
                    <q-menu>
                      <q-space />

                      <q-btn
                        dense
                        class="float-right q-ma-sm bg-red text-white"
                        round
                        size="sm"
                        v-close-popup
                        flat
                        icon="close"
                      />

                      <div class="q-pa-sm q-mt-md">
                        <q-select
                          filled
                          multiple
                          emit-value
                          map-options
                          v-model="column_options_selected[col.field]"
                          :options="column_options[col.field]"
                          style="width: 150px !important"
                          @input="checkval(col.field)"
                        />
                      </div>
                      <q-btn
                        color="primary"
                        class="float-right q-mr-sm q-mb-sm text-capitalize"
                        size="sm"
                        v-close-popup
                        @click="$set(column_options_selected, col.field, [])"
                        :label="$t('common.clear')"
                      />
                    </q-menu>
                  </q-btn>
                </div>
              </div>
            </q-th>
          </q-tr>
          <q-tr :props="props" class="ignore-elements" v-if="columns_filter">
            <q-th auto-width v-if="selection_prop != 'none'"></q-th>
            <q-th
              :key="col.name"
              v-for="col in props.cols"
              style="padding: 0px 0px 0px 0px"
            >
              <q-select
                v-if="
                  col.hasOwnProperty('filter_type') &&
                  col.filter_type == 'select'
                "
                dense
                filled
                multiple
                emit-value
                map-options
                v-model="column_options_selected[col.field]"
                :options="column_options[col.field]"
                @input="() => applySelectFilter(col)"
              >
                <template v-slot:append>
                  <q-icon
                    v-if="column_options_selected[col.field].length > 0"
                    name="close"
                    @click.stop="
                      $set(column_options_selected, col.field, []);
                      $emit('construct-filter', { field: col.field, clear: true })
                    "
                    class="cursor-pointer"
                  />
                </template>
              </q-select>

              <q-input
                dense
                filled
                v-if="
                  !col.hasOwnProperty('filter_type') ||
                  col.filter_type == 'text'
                "
                color="teal"
                class="q-pl-xs q-pr-xs"
                v-model="filter_data[col.field]"
                @input="() => applyTextFilter(col)"
                @clear="$emit('construct-filter', { field: col.field, clear: true })"
              >
                <template v-if="filter_data[col.field]" v-slot:append>
                  <q-icon
                    name="cancel"
                    @click.stop="
                      filter_data[col.field] = '';
                      $emit('construct-filter', { field: col.field, clear: true })
                    "
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
            </q-th>
          </q-tr>
        </template>

        <template v-slot:top-right="props">
          <div class="row q-gutter-sm">
            <div v-show="checkRole(['Super Admin', 'Admin'])">
              <div class="row q-gutter-xs col-xs-12">
                <q-btn
                  v-if="mvItrack"
                  ripple
                  no-caps
                  size="md"
                  unelevated
                  color="amber-14"
                  icon="track_changes"
                  class="text-black text-subtitle1"
                  :label="$t('common.moveToITrack')"
                  :disable="selected_prop && selected_prop.length ? false : true"
                  @click="selectedRowsTagITrack"
                >
                  <q-tooltip v-if="selected_prop.length === 0">
                    {{ $t("iworkshop.tagIdea") }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="text-subtitle1"
                  ripple
                  dense
                  icon="update"
                  color="amber-14"
                  unelevated
                  text-color="black"
                  no-caps
                  v-if="addVolume"
                  :label="$t('common.submitVolume')"
                  @click="$emit('updateVol', '')"
                />
                <q-btn
                  :disable="selected_prop.length === 0"
                  class="text-subtitle1"
                  ripple
                  icon="scatter_plot"
                  color="primary"
                  unelevated
                  no-caps
                  v-if="titleId === 'ideaIReview' && getCurrentChargeCode.ptdChart"
                  :label="$t('iworkshop.pdtChart')"
                  @click="loadBubbleChart"
                />
                <q-btn
                  class="text-subtitle1"
                  ripple
                  icon="fas fa-file-excel"
                  color="primary"
                  unelevated
                  no-caps
                  v-if="titleId === 'ideaIReview'"
                  :label="$t('iworkshop.addBulkIdeas')"
                  @click="$emit('showexcel')"
                />
                <q-btn
                  :disable="selected_prop.length === 0"
                  ripple
                  no-caps
                  unelevated
                  color="primary"
                  class="text-subtitle1"
                  icon="fas fa-trash"
                  :label="$t('common.delete')"
                  v-if="titleId === 'ideaIReview'"
                  @click="$emit('deleteBulkIdeas', selected_prop)"
                />
                <q-btn
                  class="text-subtitle1"
                  color="primary"
                  unelevated
                  no-caps
                  size="md"
                  icon="fa fa-file-powerpoint"
                  v-if="ppt_download"
                  :label="$t('common.download')"
                  :disable="selected_prop && selected_prop.length ? false : true"
                  @click="downloadpptreport()"
                >
                  <q-tooltip v-if="selected_prop.length === 0">
                    {{
                      `${$t("common.select")} ${$t("common.ideas")} ${$t(
                        "common.to_be"
                      )} ${$t("common.downloaded")} `
                    }}
                  </q-tooltip>
                </q-btn>

                <q-btn
                  v-if="excel_download"
                  class="text-subtitle1"
                  size="md"
                  icon="fas fa-file-csv"
                  no-caps
                  unelevated
                  color="primary"
                  :label="$t('common.download')"
                  :disable="selected_prop && selected_prop.length ? false : true"
                  @click="downloadExcelreport"
                >
                  <q-tooltip v-if="selected_prop.length === 0">
                    {{
                      `${$t("common.select")} ${$t("common.ideas")} ${$t(
                        "common.to_be"
                      )} ${$t("common.downloaded")} `
                    }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>

            <q-select
              v-model="visibleColumns"
              multiple
              borderless
              dense
              options-dense
              :display-value="$t('common.fields')"
              color="black"
              emit-value
              map-options
              :options="columns"
              option-value="name"
              option-label="label"
              @input="$emit('visibleColumns', visibleColumns)"
            >
              <template v-slot:option="{ itemProps, itemEvents, opt }">
                <q-item v-bind="itemProps" v-on="itemEvents">
                  <q-item-section>
                    <q-item-label>
                    <span v-html="opt.label"></span>
                  </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-toggle
                      size="xs"
                      class="text-black"
                      color="primary"
                      toggle-color="black"
                      v-model="visibleColumns"
                      :val="opt.name"
                      @input="$emit('visibleColumns', visibleColumns)"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-btn
              flat
              round
              dense
              :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="props.toggleFullscreen"
            >
              <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                {{
                  props.inFullscreen
                    ? $t("common.exitFullScreen")
                    : $t("common.toggleFullscreen")
                }}
              </q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              dense
              :icon="mode === 'grid' ? 'list' : 'grid_on'"
              @click="
                setIPhoneListAndGrid();
                mode = mode === 'grid' ? 'list' : 'grid';
                separator = mode === 'grid' ? 'none' : 'horizontal';
              "
            >
              <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                {{ mode === "grid" ? $t("common.list") : $t("common.grid") }}
              </q-tooltip>
            </q-btn>

            <q-btn
              v-if="showRefetch"
              flat
              round
              dense
              icon="refresh"
              @click="$emit('refetch-data')"
            >
              <q-tooltip :disable="$q.platform.is.mobile" v-close-popup>
                Refetch data
              </q-tooltip>
            </q-btn>
          </div>
       </template>

       <template v-slot:body="props">
        <q-tr :props="props" v-if="!hasDefaultSlot">
          <q-td auto-width v-if="selection_prop != 'none'">
            <q-checkbox color="primary" v-model="props.selected" />
          </q-td>

          <q-td v-for="col in columns" :key="col.name" :props="props">
            <span
              v-if="
                ![
                  'tag',
                  'index',
                  'mlStartdate',
                  'ideaImplDate',
                  'mlEndDate',
                  'mlduration',
                  'afterPicture',
                  'currentPicture',
                  'action',
                  'archType',
                  'milestone',
                  'estimatedAnnualVol',
                  'pedningFunc',
                  'pedningSubFunc',
                  'pendingWithUser',
                  'status',
                  'applVarients',
                  'Saving',
                  'delayedStatus',
                  'ilLevel',
                  'weightedSaving',
                  'deficulityOfImplementation',
                  'timeToImplement'
                ].includes(col.name)
              "
            >
              <span class="my-table-details" v-if="col.name != '_id'">
                {{ props.row[col.field] }}
                <q-tooltip
                  max-height="400px"
                  content-class="bg-grey-6 text-white text-subtitle1 shadow-4"
                  max-width="400px"
                  anchor="top middle"
                  self="top middle"
                >{{ props.row[col.field] }}</q-tooltip>
              </span>

              <div v-else>
                <span v-if="source == 'ChargeCode'">
                  <q-btn
                    class="delDashTbl"
                    flat
                    round
                    @click="$emit('delete', props.row._id)"
                    icon="delete_outline"
                  />

                  <q-btn
                    class="delDashTbl"
                    flat
                    round
                    icon="edit"
                    @click="$emit('edit', props.row._id)"
                  />
                </span>

                <span v-else class="my-table-details">
                  <q-btn
                    v-if="!hideAction"
                    color="grey-7"
                    class="customStyle"
                    sizes="xs"
                    round
                    flat
                    icon="fas fa-ellipsis-h"
                    :disable="!checkRole(['Super Admin', 'Admin'])"
                  >
                    <q-tooltip>
                      {{ `${$t("common.more")} ${$t("common.options")}` }}
                    </q-tooltip>
                    <q-menu :offset="[0, 5]">
                      <q-list>
                        <q-item
                          v-if="
                            checkRole(['Super Admin', 'Admin']) &&
                            props.row.tag !== 'ireview'
                          "
                          clickable
                          cover
                          auto-close
                        >
                          <q-item-section>
                            <q-btn
                              class="customStyle"
                              flat
                              dense
                              sizes="xs"
                              color="red"
                              icon="fas fa-trash"
                              @click="
                                $emit('rowDelete', props.row._id);
                                removeRow(props.row._id);
                              "
                            >
                              <q-tooltip
                                content-class="bg-grey-6 text-white"
                                :offset="[0, 10]"
                              >{{ $t("common.delete") }}</q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </q-item>
                        <q-item
                          v-if="
                            checkRole(['Super Admin', 'Admin']) &&
                            props.row.tag !== 'ireview'
                          "
                          clickable
                          cover
                          auto-close
                        >
                          <q-item-section>
                            <q-btn
                              class="customStyle text-subtitle1"
                              flat
                              dense
                              sizes="xs"
                              color="primary"
                              icon="fas fa-edit"
                              :disable="props.row['status'] === ''"
                              @click="
                                $emit('rowEdit', {
                                  _id: props.row._id,
                                  chargeCodeId: props.row['chargeCode._id'],
                                  bulkAdd: props.row.bulkAdd,
                                })
                              "
                            >
                              <q-tooltip
                                content-class="bg-grey-6 text-white"
                                :offset="[0, 10]"
                              >{{ $t("common.edit") }}</q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="props.row['status'] === 'Inprogress'"
                          clickable
                          cover
                          auto-close
                        >
                          <q-item-section>
                            <q-btn
                              v-if="checkRole(['Super Admin', 'Admin'])"
                              class="customStyle"
                              flat
                              dense
                              sizes="xs"
                              color="pink"
                              icon="done_all"
                              :disable="props.row['status'] === ''"
                              @click="$emit('rowCompleteStaus', props.row)"
                              no-caps
                            >
                              <q-tooltip
                                content-class="bg-grey-6 text-white"
                                :offset="[0, 10]"
                              >
                                {{
                                  `
                                  ${$t("common.complete")}
                                  ${$t("common.status")}
                                  `
                                }}
                              </q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="props.row['status'] === 'Completed'"
                          clickable
                          cover
                          auto-close
                        >
                          <q-item-section>
                            <q-btn
                              v-if="checkRole(['Super Admin', 'Admin'])"
                              class="customStyle"
                              flat
                              dense
                              sizes="xs"
                              color="positive"
                              icon="sync"
                              :disable="props.row['status'] === ''"
                              @click="$emit('rowInProgressStaus', props.row)"
                              no-caps
                            >
                              <q-tooltip
                                content-class="bg-grey-6 text-white"
                                :offset="[0, 10]"
                              >
                                {{
                                  `
                                  Change to ${$t("common.inProgress")}
                                  `
                                }}
                              </q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </q-item>

                        <q-item
                          v-if="props.row['status'] === 'Inprogress'"
                          clickable
                          cover
                          auto-close
                        >
                          <q-item-section>
                            <q-btn
                              class="customStyle"
                              flat
                              dense
                              sizes="xs"
                              color="info"
                              icon="fas fa-external-link-alt"
                              @click="$emit('OpenItem', props.row._id)"
                            >
                              <q-tooltip
                                content-class="bg-grey-6 text-white"
                                :offset="[0, 10]"
                              >{{ $t("common.addIdea") }}</q-tooltip>
                            </q-btn>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </span>
              </div>
            </span>
            <span v-if="col.name === 'index'" class="text-italic">{{ props.row[col.field] }}</span>

            <template v-if="col.name === 'afterPicture' || col.name === 'currentPicture'">
              <q-img
                v-if="props.row[col.field] && props.row[col.field]['orignalName']"
                class="zoom"
                :src="props.row[col.field].signedUrl || `data:${getFileType(props.row[col.field].orignalName)};base64,${props.row[col.field].base64}`"
                :ratio="16 / 9"
                contain
                style="
                  height: 80px;
                  width: 80px;
                  object-fit: scale-down;
                  background-size: cover;
                  display: flex;
                "
              />
            </template>

            <template v-if="col.name === 'archType'">
              <span v-if="props.row[col.field]" class="my-table-details">
                {{ props.row[col.field].name ? props.row[col.field].name : props.row[col.field] }}
              </span>
              <q-popup-edit
                persistent
                v-model="props.row[col.field]"
                :disable="!checkRole(['Super Admin', 'Admin'])"
                buttons
                color="blue"
                :label-set="$t('common.save')"
                :label-cancel="$t('common.close')"
                @save="
                  saveData(
                    props.row,
                    {
                      archType: props.row[col.field],
                      milestoneList: props.row[col.field].archMlList,
                      milestone: null,
                      mlduration: 0,
                      ilLevel: null
                    },
                    'idea',
                    'archType'
                  );
                "
              >
                <q-select
                  :label="$t('itrack.archtype')"
                  v-model="props.row[col.field]"
                  option-value="_id"
                  option-label="name"
                  :options="archTypeOptons"
                ></q-select>
              </q-popup-edit>
            </template>

            <template v-if="col.name === 'milestone'">
              <span v-if="props.row[col.field]" class="my-table-details">
                {{ props.row[col.field] || formateMilestone }}
              </span>
              <q-popup-edit
                persistent
                v-model="props.row[col.field]"
                :disable="!checkRole(['Super Admin', 'Admin'])"
                buttons
                color="blue"
                :label-set="$t('common.save')"
                :label-cancel="$t('common.close')"
                @save="
                  props.row['mlduration'] = props.row[col.field].value;
                  props.row['ilLevel'] = props.row[col.field].ilLevel;
                  props.row['mlStartdate'] = getMmlStartDate(props.row.mlStartdate);
                  setMltimeline(
                    props.row,
                    props.row['milestoneList'],
                    props.row['milestone'],
                    props.row['mlduration'],
                    props.row['mlStartdate'],
                    props.row['archType'].archMlList,
                    props.row['archType'],
                    props.row['ilLevel']
                  );
                "
              >
                <q-select
                  square
                  outlined
                  option-value="_id"
                  option-label="name"
                  v-model="props.row[col.field]"
                  :label="`${$t('common.current')} ${$t('common.milestone')}`"
                  class="text-bold col-xl-4 col-sm-4 col-md-4 q-pa-xs col-xs-12"
                  :options="(props.row['archType'] && props.row['archType'].archMlList && props.row['archType'].archMlList.length) ? props.row['archType'].archMlList : props.row['milestoneList']"
                />
              </q-popup-edit>
            </template>

            <template v-if="col.name === 'ilLevel'">
              <span v-if="props.row[col.field]" class="my-table-details">
                {{ getIlLevel(props.row[col.field]) }}
              </span>
            </template>

            <template v-if="col.name === 'mlStartdate'">
              <span class="my-table-details">{{ props.row[col.field] || formatDate }}</span>
              <q-popup-edit
                persistent
                v-model="props.row[col.field]"
                :disable="!checkRole(['Super Admin', 'Admin'])"
                buttons
                color="blue"
                :label-set="$t('common.save')"
                :label-cancel="$t('common.close')"
                @save="
                  setMltimeline(
                    props.row,
                    props.row['milestoneList'],
                    props.row['milestone'],
                    props.row['mlduration'],
                    props.row['mlStartdate'],
                    props.row['archType'].archMlList,
                    props.row['archType'],
                    props.row['ilLevel']
                  )
                "
              >
                <q-input
                  :label="$t('common.milestoneStrtDate')"
                  v-model="props.row[col.field]"
                  mask="date"
                  :rules="['date']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="qDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="props.row[col.field]" today-btn>
                          <div class="row items-center justify-end q-gutter-sm">
                            <q-btn label="Cancel" color="primary" flat v-close-popup />
                            <q-btn label="OK" color="primary" flat v-close-popup />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </q-popup-edit>
            </template>

            <template v-if="col.name === 'mlduration'">
              <span class="my-table-details">{{ props.row[col.field] }}</span>
              <q-popup-edit
                persistent
                v-model="props.row[col.field]"
                :disable="!checkRole(['Super Admin', 'Admin'])"
                buttons
                color="blue"
                :label-set="$t('common.save')"
                :label-cancel="$t('common.close')"
                @save="
                  setMltimeline(
                    props.row,
                    props.row['milestoneList'],
                    props.row['milestone'],
                    props.row['mlduration'],
                    props.row['mlStartdate'],
                    props.row['archType'].archMlList,
                    props.row['archType'],
                    props.row['ilLevel']
                  )
                "
              >
                <q-input
                  outlined
                  square
                  type="number"
                  class="text-bold col-xl-4 col-sm-4 col-md-4 q-pa-xs col-xs-12"
                  :label="`${$t('common.milestone')} ${$t('common.duration')}`"
                  v-model="props.row[col.field]"
                  :suffix="props.row['mlUnit']"
                />
              </q-popup-edit>
            </template>


            <template v-if="col.name === 'mlEndDate'">
              <span class="my-table-details">{{ props.row[col.field] || formatDate }}</span>
            </template>

            <template v-if="col.name === 'delayedStatus'">
              <q-badge
                v-if="props.row['delayedState']"
                no-caps
                color="positive"
                class="text-white"
              >{{ props.row[col.field] }}</q-badge>
              <q-badge
                v-else
                color="red"
                class="text-white"
              >{{ props.row[col.field] }}</q-badge>
            </template>

<template v-if="col.name === 'ideaImplDate'">
  <span class="my-table-details">{{ props.row[col.field] || formatDate }}</span>
  <q-popup-edit
    persistent
    v-model="props.row[col.field]"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    buttons
    no-caps
    color="primary"
    :label-set="$t('common.save')"
    :label-cancel="$t('common.close')"
  >
    <q-input
      :label="$t('common.milestoneEndDate')"
      v-model="props.row[col.field]"
      mask="date"
      :rules="['date']"
    >
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date v-model="props.row[col.field]">
              <div class="row items-center justify-end q-gutter-sm">
                <q-btn label="Cancel" color="primary" flat v-close-popup />
                <q-btn label="OK" color="primary" flat v-close-popup />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </q-popup-edit>
</template>

<template v-if="col.name === 'deficulityOfImplementation'">
  <span class="my-table-details">{{ props.row[col.field] }}</span>
  <q-popup-edit
    persistent
    v-model="props.row[col.field]"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    buttons
    color="blue"
    :label-set="$t('common.save')"
    :label-cancel="$t('common.close')"
    @save="
      saveData(
        props.row,
        { deficulityOfImplementation: props.row[col.field] },
        'idea'
      )
    "
  >
    <q-select
      v-model="props.row[col.field]"
      square
      outlined
      class="text-bold col-xl-4 col-sm-4 col-md-4 q-pa-xs col-xs-12"
      :label="$t('itrack.diffOfImp')"
      clearable
      single
      :options="difficultyOptions"
    />
  </q-popup-edit>
</template>

<template v-if="col.name === 'timeToImplement'">
  <span class="my-table-details">{{ props.row[col.field] }}</span>
  <q-popup-edit
    persistent
    v-model="props.row[col.field]"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    buttons
    color="blue"
    :label-set="$t('common.save')"
    :label-cancel="$t('common.close')"
    :validate="timeToImplementRangeValidation"
    @save="
      saveData(
        props.row,
        { timeToImplement: props.row[col.field] },
        'idea'
      )
    "
  >
    <q-input
      type="number"
      :label="$t('common.timeToImp')"
      v-model.number="props.row[col.field]"
      :hint="$t('common.numberBetween1To48')"
      :error="timeToImplementError"
      :error-message="timeToImplementErrorMessage"
      :rules="[
        (val) =>
          (!!val && Number(val) >= 1 && Number(val) <= 48) ||
          $t('itrack.validNum'),
      ]"
    />
  </q-popup-edit>
</template>

<template v-if="col.name === 'weightedSaving'">
  <q-badge
    no-caps
    class="text-white"
  >{{ props.row[col.field] }}</q-badge>
</template>

<template v-if="col.name === 'tag'">
  <q-btn-toggle
    stack
    push
    dense
    flat
    unelevated
    :disable="
      props.row[col.field] === 'ireview' || module === 'Idea Lake'
    "
    no-caps
    v-model="props.row[col.field]"
    color="grey-1"
    text-color="grey-5"
    :toggle-color="setColor(props.row[col.field])"
    :style="$i18n.locale === 'jp' ? 'width:330px' : 'width:250px'"
    @input="
      (v) => {
        props.row[col.field] === 'ireview'
          ? (props.row[col.field] = 'accept')
          : '';
        $emit('updateTag', {
          _id: props.row._id,
          tag: props.row[col.field],
        });
      }
    "
    :options="[
      {
        label: $t('common.iReview'),
        value: 'ireview',
        icon: 'track_changes',
      },
      {
        label: $t('common.accept'),
        value: 'accept',
        icon: 'thumb_up',
      },
      {
        label: $t('common.duplicate'),
        value: 'duplicate',
        icon: 'thumb_down',
      },
      {
        label: $t('common.redBin'),
        value: 'red bin',
        icon: 'delete',
      },
      {
        label: $t('common.delete'),
        value: 'delete',
        icon: 'delete_forever',
      },
    ]"
  />
</template>

<template v-if="col.name === 'status'">
  <q-btn
    no-caps
    flat
    dense
    @click="$emit('OpenItem', props.row._id)"
  >
    <q-badge
      color="positive"
      no-caps
      v-if="props.row[col.field] === 'Inprogress'"
      class="text-white"
      >{{ $t('common.inprogress') }} - {{ $t('common.add_idea') }}</q-badge
    >
    <q-tooltip
      content-class="bg-grey-6 text-white"
      :offset="[0, 10]"
      >{{ $t("common.addIdea") }}</q-tooltip
    >
  </q-btn>
  <q-badge
    color="grey-6"
    v-if="props.row[col.field] === 'Scheduled'"
    class="text-white"
    >{{ $t('common.scheduled') }}</q-badge
  >
  <q-badge
    color="red"
    v-if="props.row[col.field] === 'Completed'"
    class="text-white text-lowercase"
    >{{ $t('common.completed') }}</q-badge
  >
</template>


<template v-if="col.name === 'pendingWithUser'">
  <span>
    {{ getPendingWithUser(props, col.field) }}
  </span>
  <q-popup-edit
    dense
    buttons
    persistent
    color="blue"
    :label-set="$t('common.save')"
    v-model="props.row[col.field]"
    :label-cancel="$t('common.close')"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    @save="() => saveTemplateData(props.row, props.row[col.field], 'pendingWithUser', '_id')"
    @before-show="() => setUserOptions(props.row['pedningSubFunc'], props.row['product_id'], props.row['index'], props.row['pedningFunc'], props.row['_id'], col.field)"
  >
    <q-select
      v-model="props.row[col.field]"
      dense
      clearable
      multiple
      use-chips
      input-debounce="0"
      option-value="_id"
      option-label="email"
      :options="getFilteredData[props.row['index'] - 1]?.userOpts || []"
    />
  </q-popup-edit>
</template>

<template v-if="col.name === 'pedningFunc'">
  <span v-if="props.row[col.field]" class="my-table-details">{{ props.row[col.field]?.name || props.row[col.field] }}</span>

  <q-popup-edit
    persistent
    v-model="props.row[col.field]"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    buttons
    color="blue"
    :label-set="$t('common.save')"
    :label-cancel="$t('common.close')"
    @save="() => saveFnData(props.row, { pedningFunc: props.row[col.field] }, 'idea')"
  >
    <q-select
      v-model="props.row[col.field]"
      square
      outlined
      dense
      clearable
      single
      input-debounce="0"
      option-value="_id"
      option-label="name"
      :options="mlFunctionOptions"
    />
  </q-popup-edit>
</template>

<template v-if="col.name === 'pedningSubFunc'">
  <span>
    {{ getPendingSubFunction(props.row, col.field) }}
  </span>

  <q-popup-edit
    persistent
    v-model="props.row[col.field]"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    buttons
    color="blue"
    :label-set="$t('common.save')"
    :label-cancel="$t('common.close')"
    @save="() => saveTemplateData(props.row, props.row[col.field], 'pedningSubFunc', '_id')"
  >
    <q-select
      v-model="props.row[col.field]"
      dense
      clearable
      multiple
      use-chips
      input-debounce="0"
      option-value="_id"
      option-label="name"
      :options="getSubFnOptions(props.row['pedningFunc'])"
      @input="() => setUserOptions(props.row['pedningSubFunc'], props.row['product_id'], props.row['index'], props.row['pedningFunc'], props.row['_id'], col.field)"
    />
  </q-popup-edit>
</template>

<template v-if="col.name === 'applVarients' && loadField">
  <span v-for="(item, index) in props.row[col.field]" :key="index">
    {{ item?.name || item }}
    {{ index !== props.row[col.field].length - 1 ? ',' : '' }}
  </span>

  <q-popup-edit
    v-if="loadField"
    persistent
    v-model="props.row[col.field]"
    :disable="!checkRole(['Super Admin', 'Admin'])"
    buttons
    color="blue"
    :label-set="$t('common.save')"
    :label-cancel="$t('common.close')"
    @before-show="() => getProductsVarients(props.row['product_id'], props.row['index'])"
    @save="() => saveData(props.row, { applVarients: props.row[col.field], applicableVol: props.row.estimatedAnnualVol }, 'idea', col.field, props.row['index'])"
  >
    <q-select
      v-model="props.row[col.field]"
      dense
      clearable
      multiple
      use-chips
      input-debounce="0"
      option-value="_id"
      option-label="name"
      :options="getFilteredData[props.row['index'] - 1]?.productVareients || []"
      @input="setApplVolume(props.row[col.field], props.row['index'])"
    />
  </q-popup-edit>
</template>

<q-input
  dense
  class="my-table-details"
  :disable="title === 'Idea iReview'"
  v-if="col.name === 'estimatedAnnualVol'"
  v-model="props.row.estimatedAnnualVol"/>
<q-input
  class="my-table-details"
  v-if="col.name === 'Saving'"
  v-model="props.row['saving']"
  dense
  :disable="props.row.tag === 'ireview' || !checkRole(['Super Admin', 'Admin']) || disableSaving"
  @keypress.enter="() => saveData(props.row, { saving: props.row[col.field] }, 'idea')"
/>

<!-- Icap Manage Workshop Actions -->
<div class="row" v-if="col.name === 'action'">
  <q-card-section>
    <div class="row items-center no-wrap">
      <q-btn
        color="grey-7"
        class="customStyle"
        sizes="xs"
        round
        flat
        icon="fas fa-ellipsis-h"
      >
        <q-menu :offset="[0, 5]">
          <q-list>
            <q-item
              v-if="checkRole(['Super Admin', 'Admin']) && props.row.tag !== 'ireview'"
              clickable
              cover
              auto-close
            >
              <q-item-section>
                <q-btn
                  class="customStyle"
                  flat
                  dense
                  sizes="xs"
                  color="red"
                  icon="fas fa-trash"
                  @click="$emit('rowDelete', props.row._id)"
                >
                  <q-tooltip content-class="bg-grey-6 text-white" :offset="[0, 10]">{{ $t("common.delete") }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="user" clickable cover auto-close>
              <q-item-section>
                <q-btn
                  class="customStyle"
                  flat
                  dense
                  sizes="xs"
                  color="primary"
                  icon="fas fa-edit"
                  :disable="props.row['status'] === ''"
                  @click="$emit('rowEdit', props.row._id)"
                >
                  <q-tooltip content-class="bg-grey-6 text-white" :offset="[0, 10]">{{ $t("common.edit") }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>

            <q-item
              v-if="props.row['status'] === 'Inprogress'"
              clickable
              cover
              auto-close
            >
              <q-item-section>
                <q-btn
                  class="customStyle"
                  flat
                  dense
                  sizes="xs"
                  color="info"
                  icon="fas fa-external-link-alt"
                  @click="$emit('OpenItem', props.row._id)"
                >
                  <q-tooltip content-class="bg-grey-6 text-white" :offset="[0, 10]">{{ $t("common.addIdea") }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>

        <q-tooltip
  content-class="bg-grey-6 text-white"
  :offset="[0, 10]"
>{{ `${$t("common.more")} ${$t("common.options")}` }}</q-tooltip>
</q-btn>
</div>
</q-card-section>
</div>
</q-td>
</q-tr>
</template>

<template v-slot:item="props">
  <div
    class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
    :style="props.selected ? 'transform: scale(0.95);' : ''"
  >
    <q-card :class="props.selected ? 'bg-grey-2' : ''">
      <q-card-section>
        <q-checkbox dense v-model="props.selected" :label="props.row.name"></q-checkbox>
      </q-card-section>
      <q-separator />
      <q-list>
        <q-item
          v-for="col in props.cols.filter((col) => col.name !== 'desc')"
          :key="col.name"
        >
          <q-item-section>
            <q-item-label>{{ col.label }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="col.name === 'action'" side>
            <q-card-section class="q-mt-none">
              <div class="row items-center no-wrap">
                <q-btn
                  color="grey-7"
                  class="customStyle"
                  sizes="xs"
                  round
                  flat
                  icon="fas fa-ellipsis-h"
                >
                  <q-tooltip>
                    {{ `${$t("common.more")} ${$t("common.options")}` }}
                  </q-tooltip>

                  <q-menu :offset="[0, 5]">
                    <q-list>
                      <q-item
                        v-if="
                          checkRole(['Super Admin', 'Admin']) &&
                          props.row.tag !== 'ireview'
                        "
                        clickable
                        cover
                        auto-close
                      >
                        <q-item-section>
                          <q-btn
                            class="customStyle"
                            flat
                            dense
                            sizes="xs"
                            color="red"
                            icon="fas fa-trash"
                            @click="$emit('rowDelete', props.row._id)"
                          >
                            <q-tooltip
                              content-class="bg-grey-6 text-white"
                              :offset="[0, 10]"
                            >{{ $t("common.delete") }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="user" clickable cover auto-close>
                        <q-item-section>
                          <q-btn
                            class="customStyle"
                            flat
                            dense
                            sizes="xs"
                            color="primary"
                            icon="fas fa-edit"
                            :disable="props.row['status'] === ''"
                            @click="$emit('rowEdit', props.row._id)"
                          >
                            <q-tooltip
                              content-class="bg-grey-6 text-white"
                              :offset="[0, 10]"
                            >{{ $t("common.edit") }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="props.row['status'] === 'Inprogress'"
                        clickable
                        cover
                        auto-close
                      >
                        <q-item-section>
                          <q-btn
                            class="customStyle"
                            flat
                            dense
                            sizes="xs"
                            color="info"
                            icon="fas fa-external-link-alt"
                            @click="$emit('OpenItem', props.row._id)"
                          >
                            <q-tooltip
                              content-class="bg-grey-6 text-white"
                              :offset="[0, 10]"
                            >{{ $t("common.addIdea") }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                  <q-tooltip
                    content-class="bg-grey-6 text-white"
                    :offset="[0, 10]"
                  >{{
                    `${$t("common.more")} ${$t("common.options")}`
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-item-section>
          <q-item-section v-else side>
            <q-item-label
              v-if="
                col.name != '_id' &&
                col.name !== 'afterPicture' &&
                col.name !== 'currentPicture'
              "
              caption
            >
              <q-item-label
                v-if="col.name === 'status'"
                :style="
                  $q.platform.is.mobile
                    ? 'width: 150px;'
                    : 'width: 200px;'
                "
                style="word-break: break-all; text-align: right"
              >
                <q-btn
                  flat
                  no-caps
                  dense
                  @click="$emit('OpenItem', props.row._id)"
                >
                  <q-badge
                    color="positive"
                    no-caps
                    v-if="props.row[col.field] === 'Inprogress'"
                    class="text-white"
                  >
                    {{ props.row[col.field] }} - Add Idea
                  </q-badge>
                  <q-tooltip
                    content-class="bg-grey-6 text-white"
                    :offset="[0, 10]"
                  >
                    {{ $t("common.addIdea") }}
                  </q-tooltip>
                </q-btn>
                <q-badge
                  color="grey-6"
                  v-if="props.row[col.field] === 'Scheduled'"
                  class="text-white text-lowercase"
                >
                  {{ props.row[col.field] }}
                </q-badge>
                <q-badge
                  color="red"
                  v-if="props.row[col.field] === 'Completed'"
                  class="text-white text-lowercase"
                >
                  {{ props.row[col.field] }}
                </q-badge>
              </q-item-label>
              <q-item-label
                v-else
                :style="
                  $q.platform.is.mobile
                    ? 'width: 150px;'
                    : 'width: 200px;'
                "
                style="
                  font-size: 15px;
                  color: black;
                  word-break: break-all;
                  text-align: right;
                "
              >
                <span v-if="col.value !== '-'">
                  {{ col.value }}
                </span>
              </q-item-label>
            </q-item-label>

            <div
              v-if="col.name === 'currentPicture'"
              style="font-size: 15px; color: black"
            >
              {{ `${$t("common.current")} ${$t("common.image")}` }}
              <q-img
                v-if="
                  props.row[col.field] &&
                  props.row[col.field]['orignalName']
                "
                class="zoom"
                :src="
                  props.row[col.field].signedUrl ||
                  `data:${getFileType(
                    props.row[col.field].orignalName
                  )};base64,${props.row[col.field].base64}`
                "
                :ratio="16 / 9"
                contain
                style="
                  width: 100px;
                  height: 100px;
                  display: flex;
                  object-fit: scale-down;
                  background-size: cover;
                  margin-left: 15px !important;
                "
              />
            </div>
            <div
              v-if="col.name === 'afterPicture'"
              style="font-size: 15px; color: black"
            >
              {{ `${$t("ibase.after")} ${$t("common.image")}` }}
              <q-img
                v-if="
                  props.row[col.field] &&
                  props.row[col.field]['orignalName']
                "
                :src="
                  props.row[col.field].signedUrl ||
                  `data:${getFileType(
                    props.row[col.field].orignalName
                  )};base64,${props.row[col.field].base64}`
                "
                :ratio="16 / 9"
                contain
                style="max-width: 100px; height: 100px"
              />
            </div>

            <div v-else-if="col.name == '_id'">
              <span v-if="source == 'ChargeCode'">
                <q-btn
                  class="delDashTbl"
                  flat
                  round
                  @click="$emit('delete', props.row._id)"
                  icon="delete_outline"
                />

                <q-btn
                  class="delDashTbl"
                  flat
                  round
                  icon="edit"
                  @click="$emit('edit', props.row._id)"
                />
              </span>
              <span v-else>
                <q-btn
                  v-if="!hideAction"
                  color="grey-7"
                  class="customStyle"
                  sizes="xs"
                  round
                  flat
                  icon="fas fa-ellipsis-h"
                  :disable="!checkRole(['Super Admin', 'Admin'])"
                >
                  <q-tooltip>
                    {{ `${$t("common.more")} ${$t("common.options")}` }}
                  </q-tooltip>
                  <q-menu :offset="[0, 5]">
                    <q-list>
                      <q-item
                        v-if="
                          checkRole(['Super Admin', 'Admin']) &&
                          props.row.tag !== 'ireview'
                        "
                        clickable
                        cover
                        auto-close
                      >
                        <q-item-section>
                          <q-btn
                            class="customStyle"
                            flat
                            dense
                            sizes="xs"
                            color="red"
                            icon="fas fa-trash"
                            @click="$emit('rowDelete', props.row._id)"
                          >
                            <q-tooltip
                              content-class="bg-grey-6 text-white"
                              :offset="[0, 10]"
                            >{{ $t("common.delete") }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                      <q-item v-if="user" clickable cover auto-close>
                        <q-item-section>
                          <q-btn
                            class="customStyle"
                            flat
                            dense
                            sizes="xs"
                            color="primary"
                            icon="fas fa-edit"
                            :disable="props.row['status'] === ''"
                            @click="$emit('rowEdit', props.row._id)"
                          >
                            <q-tooltip
                              content-class="bg-grey-6 text-white"
                              :offset="[0, 10]"
                            >{{ $t("common.edit") }}</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>




                      <q-item
                                v-if="props.row['status'] === 'Completed'"
                                clickable
                                cover
                                auto-close
                              >
                                <q-item-section>
                                  <q-btn
                                    v-if="checkRole(['Super Admin', 'Admin'])"
                                    class="customStyle"
                                    flat
                                    dense
                                    sizes="sm"
                                    color="positive"
                                    icon="sync"
                                    :disable="props.row['status'] === ''"
                                    @click="
                                      $emit('rowInProgressStaus', props.row)
                                    "
                                    no-caps
                                  >
                                    <q-tooltip
                                      content-class="bg-grey-6 text-white"
                                      :offset="[0, 10]"
                                    >
                                      {{
                                        `Change to ${$t("common.inProgress")}`
                                      }}
                                    </q-tooltip>
                                  </q-btn>
                                </q-item-section>
                              </q-item>

                              <q-item
                                v-if="props.row['status'] === 'Inprogress'"
                                clickable
                                cover
                                auto-close
                              >
                                <q-item-section>
                                  <q-btn
                                    class="customStyle"
                                    flat
                                    dense
                                    sizes="xs"
                                    color="info"
                                    icon="fas fa-external-link-alt"
                                    @click="$emit('OpenItem', props.row._id)"
                                  >
                                    <q-tooltip
                                      content-class="bg-grey-6 text-white"
                                      :offset="[0, 10]"
                                      >{{ $t("common.addIdea") }}</q-tooltip
                                    >
                                  </q-btn>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-menu>
                        </q-btn>
                      </span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </template>
      </q-table>
      <transition
        appear
        :duration="500"
        enter-active-class="animated fadeInUpBig"
        leave-active-class="animated fadeOutDown"
      >
        <q-page-sticky
          v-if="actions && selected_prop.length > 0"
          position="bottom"
          :offset="[0, 45]"
        >
          <div class="row col-12 justify-center q-gutter-sm">
            <q-btn
              rounded
              v-for="(action, i) in actions"
              :label="action.label"
              :key="i"
              :icon="action.icon"
              color="primary"
              class="text-white"
              @click="$emit('OpenItem', selected_prop[0]._id)"
            />
          </div>
        </q-page-sticky>
      </transition>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue';
import { uid, date } from 'quasar';
import PptxGenJS from 'pptxgenjs';
import Sortable from 'sortablejs';
import { saveAs } from 'file-saver';
import { useStore } from 'vuex';
import * as ExcelJS from 'exceljs/dist/exceljs.js';

import roleDirective from '@/directive/role'; // NOTE Permission directive (v-role)
import permission from '@/directive/permission'; // NOTE Permission directive (v-permission)
import useExcelHelper from '@/composables/excel-helper';

const addToDate = date.addToDate;

const props = defineProps([
  'levelval',
  'data',
  'columns',
  'file_name',
  'ppt_download',
  'excel_download',
  'columns_filter',
  'header_filter',
  'draggable',
  'classes',
  'separator1',
  'dense',
  'dark',
  'flat',
  'bordered',
  'square',
  'selection',
  'selected',
  'source',
  'title',
  'titleId',
  'mvItrack',
  'role',
  'addVolume',
  'archTypeOptons',
  'mlFunctionOptions',
  'hideAction',
  'columnState',
  'loadBubbleChart',
  'module',
  'paginationOptions',
  'loader',
  'showRefetch',
  'disableSaving'
]);

const directives = { permission, roleDirective };

const _ = ref();
const uuid = ref('');
const rowdata = ref([]);
const actions = ref([]);
const tgColor = ref(null);
const clearval = ref(true);
const columndata = ref([]);
const filter_data = ref({});
const loadField = ref(true);
const iPhoneStyle = ref('');
const userRowData = ref([]);
const columnlabel = ref([]);
const objWorkeshop = ref([]);
const column_options = ref({});
const column_options_selected = ref({});
const filter_flags = ref({});
const selection_prop = ref('single');
const name = ref('');
const selected_prop = ref([]);
const visibleColumns = ref([]);
const mode = ref('list');
const filter = ref('');
const fromimage = ref([]);
const toimage = ref([]);
const pagination = ref({
  rowsPerPage: 0,
});
const timeToImplementError = ref(false);
const timeToImplementErrorMessage = ref('');

const store = useStore();
const { roles } = store.getters;
const user = computed(() => store.getters['VTL/user']);
const getCurrentChargeCode = computed(() => store.getters['VTL/getCurrentChargeCode']);
const findIdeaGetter = computed(() => store.getters['idea/find']);
const getIdeaGetter = computed(() => store.getters['idea/get']);
const ideaUpdated = computed(() => store.getters['idea/patched']);

const difficultyOptions = computed(() => {
  let options = Array.from({ length: 10 }, (_, i) => i + 1);
  return options;
});

const getUserRowData = computed(() => userRowData.value);

const getFilteredData = computed(() => {
  const table_columns = props.columns.map(item => item.field);
  return props.data.filter(item => {
    return table_columns.every((field, i) => {
      if (filter_data.value[field] === '') return true;
      if (
        field in filter_data.value &&
        item[field] &&
        item[field].toString().toLowerCase().includes(filter_data.value[field].toLowerCase())
      ) {
        return true;
      }
      return false;
    });
  });
});

const getFilteredValuesData = computed(() => {

  let table_Data = getFilteredData.value.filter(item => {
    const filters = Object.values(column_options_selected.value).filter(row => row.length > 0);
    const filteredData = filters.map(filter => {
      const index = Object.values(column_options_selected.value).indexOf(filter);
      const field = Object.keys(column_options_selected.value)[index];

      if (Array.isArray(item[field])) {
        return filter.includes(item[field].map(el => el._id).join('_').toLowerCase());
      } else if (typeof item[field] === 'object') {
        const { _id, name, newNameWithPath } = item[field];
        return filter.includes(`${_id}_${name}`) || filter.includes(name) || filter.includes(newNameWithPath);
      } else if (typeof item[field] === 'string') {
        return filter.includes(item[field].toLowerCase());
      }
      return false;
    });

    return !filteredData.includes(false);
  });

  return table_Data;
});

const hasDefaultSlot = computed(() => {
  return !!slots.body;
});

// Watchers
watch(ideaUpdated, (idea) => {
  if (idea) {
    // console.log(_.find(getFilteredValuesData.value, { _id: idea._id }), idea)
  }
});

watch(selected_prop, () => {
  emit("selected-val", selected_prop.value);
});

watch(locale, (val) => {
  if (val) {
    locale.value = val;
  }
});

watch(props.levelval, (val) => {
  if (val && val.level && clearval.value) {
    column_options_selected.value[val.level] = [val.node];
  }
});

watch(column_options_selected, (newVal) => {
  column_options_selected.value = { ...newVal };
});



// Lifecycle Hooks
onBeforeMount(() => {
  uuid.value = uid();
  visibleColumns.value = props.columnState?.length ? props.columnState : props.columns.map(col => col.name);

  if (props.selection === undefined) {
    selection_prop.value = "none";
  }

  props.columns.forEach((item) => {
    column_options.value[item.field] = [];
    column_options_selected.value[item.field] = [];
    filter_flags.value[item.field] = false;
  });

  props.data.forEach((item) => {
    props.columns.forEach((column) => {
      if (item.hasOwnProperty(column.field)) {
        if (Array.isArray(item[column.field])) {
          const name = item[column.field][0]?.name;
          column_options.value[column.field].push({
            label: name || "",
            value: item[column.field].map((i) => i._id).join("_").toLowerCase().replace(/_/g, "_") || "",
          });
        } else if (typeof item[column.field] === "object") {
          const { _id, name, newNameWithPath } = item[column.field];
          column_options.value[column.field].push({
            label: name || newNameWithPath || "",
            value: `${_id}_${name}` || newNameWithPath || "",
          });
        } else {
          column_options.value[column.field].push({
            label: item[column.field]?.toString() || "",
            value: item[column.field]?.toString().toLowerCase().replace(/_/g, "_") || "",
          });
        }
      }
    });
  });

  Object.keys(column_options.value).forEach((field) => {
    column_options.value[field] = Array.from(
      new Map(column_options.value[field].map((item) => [item["value"], item])).values()
    );
  });
});

onMounted(() => {
  if (store.commit("VTL/toggleSpinner") === true) {
    store.commit("VTL/toggleSpinner", false);
  }
  clearval.value = true;
});

/////////////////////////////////////////////////////////////////////////

// Methods
const getPendingSubFunction = (row, field) => row[field].map((item) => item.name).join(",");
const getIlLevel = (data) => (typeof data === "object" ? data.name : data);
const getVariants = (options) => Array.from(new Set(options.map((opt) => opt._id)));
const virtualScroll = (data) => emit("virtual-scroll", data);
const getFileType = (imageName) => `image/${imageName.split(".").pop()}`;

const applySelectFilter = (col) => {
  emit("construct-filter", {
    clear: false,
    field: col.field,
    options: column_options.value[col.field],
    value: column_options_selected.value[col.field],
  });
};

const applyTextFilter = (col) => {
  emit("construct-filter", {
    field: col.field,
    value: filter_data.value[col.field],
  });
};

const modifyFieldNameToColName = (item) => {
  switch (item) {
    case "index":
      return t("common.seqNo");
    case "_id":
      return t("common.action");
    case "tag":
      return t("common.action");
    default:
      return item;
  }
};

const checkval = (val) => {
  if (val !== this.levelval.level) {
    this.clearval = false;
  }
};

const setIPhoneListAndGrid = () => {
  if (this.$q.platform.is.iphone) {
    this.mode = this.mode === "grid" ? "list" : "grid";
    return this.mode;
  }
};

const getMmlStartDate = (mlDate) => {
  const mlStartDate = mlDate || new Date();
  return date.formatDate(mlStartDate, "YYYY-MM-DD");
};

const timeToImplementRangeValidation = (val) => {
  if (!(val >= 1 && val <= 48)) {
    this.timeToImplementError = true;
    this.timeToImplementErrorMessage = "The value must be between 1 and 48!";
    return false;
  }

  this.timeToImplementError = false;
  this.timeToImplementErrorMessage = "";
  return true;
};

const removeRow = (id) => {};

const checkRole = (access) => this.roles.some((el) => access.includes(el));

const getSubFnOptions = (fn) => {
  if (!fn) return [];
  const fnName = _.value.isString(fn) ? fn : fn.name;
  const fnArr = this.mlFunctionOptions.find((x) => x.name === fnName);
  return fnArr ? fnArr.dataSource : [];
};

const saveFnData = (data, modifiedData, service) => {
  const dataExist = _.value.pick(
    this.$store.getters[`idea/get`](data._id),
    ['currentPicture', 'afterPicture', 'refPicture', 'audio', 'video']
  );

  if (this.$checkIsSuperAdminHasAccess(this.user.role, this)) {
    this.toggleSpinner(true);
    this.$store
      .dispatch(`${service}/patch`, [data._id, modifiedData])
      .then((res) => {
        this.toggleSpinner(false);
        if (res) {
          this.$store.commit(`idea/updateItem`, _.value.merge(dataExist, res));
          this.$q.notify("Record saved");
        }
      });
  } else {
    this.toggleSpinner(false);
  }
};

const saveData = (data, modifiedData, service, field, index = null) => {
  if (this.$checkIsSuperAdminHasAccess(this.user.role, this)) {
    this.toggleSpinner(true);
    let dataExist = _.value.pick(
      _.value.cloneDeep(this.$store.getters[`idea/get`](data._id)),
      ['currentPicture', 'afterPicture', 'refPicture', 'audio', 'video']
    );

    const query = {
      $populate: [
        { path: "applVarients", select: "name" },
        { path: "pendingWithUser", select: "email" }
      ]
    };

    if (field === 'archType') {
      const update = { milestone: null, mlduration: null, ilLevel: null };
      dataExist = _.value.merge(dataExist, update);
    }

    if (modifiedData?.ilLevel?.name?.name) {
      modifiedData.ilLevel.name = modifiedData.ilLevel.name.name;
    }

    if (modifiedData?.milestone) {
      modifiedData.milestone = _.value.omit(modifiedData.milestone, ['_id']);
    }

    this.$store.dispatch(`${service}/patch`, [data._id, modifiedData, { query }])
      .then((res) => {
        this.toggleSpinner(false);
        const subFunctions = getSubFnOptions(data.pedningFunc);
        const pedningSubFunc = _.value.filter(subFunctions, (row) => _.value.includes(res.pedningSubFunc, row._id));

        if (res) {
          this.$q.notify(this.$t("itrack.recordSuccess"));
          this.$store.commit(`idea/updateItem`, { ..._.value.merge(dataExist, res), pedningSubFunc });
        }

        this.$emit('ideaUpdated', {
          ..._.value.merge(data, modifiedData),
          ..._.value.pick(res, ['applVarients', 'pendingWithUser']),
          pedningSubFunc
        });

        if (index !== null) {
          this.$set(
            this.getFilteredData[index - 1],
            field, _.value.uniqBy(modifiedData[field], '_id')
          );
        }

        this.$set(data, 'pedningSubFunc', pedningSubFunc);
        this.$set(data, 'weightedSaving', ((_.value.toNumber(res.saving) * _.value.toNumber(res.applicableVol)) / _.value.toNumber(res.total_prd_volume)).toFixed(2));
      });
  } else {
    this.toggleSpinner(false);
  }
};

const getPendingwithUser = (_id) => this.$store.dispatch(`idea/get`, _id);

const setUserOptions = async (subFnName, productname, index, fn, _id, row, field) => {
  if (subFnName && productname) {
    let subFnArr = [];
    let fnObj = fn;

    subFnArr = subFnName.map((x) => {
      let id = "";
      if (_.value.isString(x)) {
        if (_.value.isString(fnObj)) {
          fnObj = _.value.filter(this.mlFunctionOptions, (v) => v.name === fn);
        }
        let selsubFn = _.value.filter(fnObj[0]?.dataSource, (fn) => fn.name === x)[0];
        id = selsubFn ? selsubFn._id : "";
      } else {
        id = x._id;
      }
      return id;
    });

    const query = {
      "productId._id": productname,
      sunFunctionId: { $in: subFnArr }
    };

    const callback = (data) => {
      this.toggleSpinner(false);

      if (data && data.length) {
        let lev1Users = data[0].productId[0].users.flatMap((x) => {
          x.il1Users;
          return x.il1Users;
        });

        this.$set(this.getFilteredData[index - 1], "userOpts", lev1Users);
      }
    };

    const { data, total } = this.$api.MapUsersToFunction.findInStore({ query });

    if (total) {
      callback(data);
    } else {
      this.toggleSpinner(true);
      this.$api.MapUsersToFunction.find({ query })
        .then((res) => callback(res.data));
    }
  }
},

getPendingWithUser = (props, field) => {
  const ideaGetter = this.getIdeaGetter(props.row?._id);
  const pendingWithUser = ideaGetter?.pendingWithUser || [];

  if (_.value.filter(props.row[field], _.value.isString)?.length) {
    this.$set(props.row, field, pendingWithUser || []);
  }

  return _.value.join(_.value.map(pendingWithUser, 'email') || [], ',');
};



const getProductsVarients = (productId, index) => {
  const { toggleSpinner } = useSpinner(); // Replace with your spinner logic
  const api = useApi(); // Using the API composable
  const filteredData = useFilteredData(); // Using the filtered data composable

  if (productId) {
    toggleSpinner(true);
    const query = {
      productId: productId,
      $select: ["_id", "name", "estimatedAnnualVol"],
    };

    const callback = (data) => {
      toggleSpinner(false);
      if (data && data.length) {
        let productVareients = data;
        filteredData[index - 1].productVareients = productVareients; // Using reactivity
      }
    };

    const { data, total } = api.Varient.findInStore({ query });

    if (total) {
      callback(data);
    } else {
      api.Varient.find({ query }).then((res) => callback(res.data));
    }
  }
};

const saveTemplateData = (rowdata, model, field, getter) => {
  const query = {};
  query[field] = model.map((x) => x[getter]);
  saveData(rowdata, query, "idea"); // Ensure saveData is defined
};

const setApplVolume = (prVarients, index) => {
  nextTick(() => {
    prVarients = _.value.filter(filteredData[index - 1]?.productVareients, (row) => _.value.includes(_.value.map(prVarients, '_id'), row?._id));
    const applicableVol = _.value.sum(_.value.map(prVarients, (row) => Number(row?.estimatedAnnualVol) || 0));

    nextTick(() => {
      filteredData[index - 1].estimatedAnnualVol = applicableVol; // Using reactivity
    });
  });
};

const setMltimeline = (
  row = null,
  mlList = null,
  curMl = null,
  curMldur = null,
  mlStartDate = null,
  archMl = null,
  arcType = null,
  ilLevel = null
) => {
  let newMlList = [];
  let varMlstatus = "";
  let varMlEndDate = null;
  let varMlStartDate = null;
  let varMlActCompleteDate = null;
  let idealMldata = _.value.cloneDeep(mlList);

  if (mlList === null || !mlList.length) {
    mlList = archMl;
  }

  if (curMl) {
    idealMldata.forEach((x, index) => {
      let cuMlName = _.value.isString(curMl) ? curMl : curMl.name;
      let curMlIndex = _.value.findIndex(mlList, ["name", cuMlName]);

      if (index === curMlIndex) {
        varMlstatus = "Inprogress";
        varMlStartDate = mlStartDate ? new Date(mlStartDate) : new Date();
        let duration = curMldur;
        x.value = curMldur;

        if (x.unit?.name === "Months" || x.unit === "Months") {
          varMlEndDate = addToDate(new Date(varMlStartDate), {
            month: _.value.toNumber(duration),
          });
        } else if (x.unit?.name === "Weeks" || x.unit === "Weeks") {
          varMlEndDate = addToDate(new Date(varMlStartDate), {
            days: 7 * _.value.toNumber(duration),
          });
        } else if (x.unit?.name === "Days" || x.unit === "Days") {
          varMlEndDate = addToDate(new Date(varMlStartDate), {
            days: _.value.toNumber(duration),
          });
        }
      } else if (curMlIndex > 0 && index < curMlIndex) {
        varMlstatus = "Completed";

        varMlStartDate = x.startDate
          ? new Date(x.startDate)
          : new Date(mlStartDate);
        varMlEndDate = x.schedulEndDate
          ? new Date(x.schedulEndDate)
          : new Date(mlStartDate);

        varMlActCompleteDate = new Date(x.actualEndDate);
        if (index === curMlIndex - 1) {
          varMlActCompleteDate = new Date();
        } else {
          varMlActCompleteDate = new Date(x.actualEndDate);
        }
      } else {
        let scheduledend = null;

        if (mlList[index]) {
          if (x.unit?.name === "Months" || x.unit === "Months") {
            varMlStartDate = addToDate(
              newMlList[index - 1]?.schedulEndDate ? new Date(newMlList[index - 1]?.schedulEndDate) : new Date(),
              { days: 1 }
            );
            varMlEndDate = addToDate(new Date(varMlStartDate), {
              month: _.value.toNumber(x.value),
            });
          } else if (x.unit?.name === "Weeks" || x.unit === "Weeks") {
            varMlStartDate = addToDate(new Date(scheduledend), { days: 1 });
            varMlEndDate = addToDate(
              newMlList[index - 1]?.schedulEndDate ? new Date(newMlList[index - 1]?.schedulEndDate) : new Date(),
              {
                days: 7 * _.value.toNumber(x.value),
              }
            );
          } else if (x.unit?.name === "Days" || x.unit === "Days") {
            varMlStartDate = addToDate(
              newMlList[index - 1]?.schedulEndDate ? new Date(newMlList[index - 1]?.schedulEndDate) : new Date(),
              { days: 1 }
            );
            varMlEndDate = addToDate(new Date(varMlStartDate), {
              days: _.value.toNumber(x.value),
            });
          }
        }
        varMlstatus = "scheduled";
      }

      if (mlStartDate && varMlStartDate.getFullYear() < new Date().getFullYear()) {
        varMlStartDate = date.formatDate(mlStartDate, "YYYY-MM-DD");
      }

      let obj = {
        name: x.name,
        startDate: varMlStartDate,
        schedulEndDate: varMlEndDate,
        actualEndDate: varMlActCompleteDate,
        value: _.value.toNumber(x.value),
        unit: x.unit,
        mlstatus: varMlstatus,
      };

      obj["ilLevel"] = x.ilLevel;
      newMlList.push(obj);
    });

    let ideaImplDate = date.formatDate(
      _.value.last(newMlList)?.schedulEndDate ? _.value.last(newMlList)?.schedulEndDate : new Date(),
      "YYYY-MM-DD"
    );

    row.ideaImplDate = ideaImplDate;
    let mlname = _.value.isString(curMl) ? curMl : curMl.name;
    let mlindex = _.value.findIndex(mlList, ["name", mlname]);
    let mlenddate = date.formatDate(
      newMlList[mlindex]?.schedulEndDate ? newMlList[mlindex]?.schedulEndDate : new Date(),
      "YYYY-MM-DD"
    );
    let munit = _.value.isObject(newMlList[mlindex]?.unit)
      ? newMlList[mlindex]?.unit?.name
      : newMlList[mlindex]?.unit;
    row.mlUnit = munit;
    row.mlEndDate = mlenddate;

    if (row && row._id) {
      let calledQuery = {
        milestoneList: newMlList,
        ideaImplDate,
        ilLevel: { name: ilLevel },
        startDate: varMlStartDate,
      };
      if (!_.value.isString(curMl)) {
        calledQuery["milestone"] = { _id: curMl._id, name: curMl.name };
      }
      if (!_.value.isString(arcType)) {
        calledQuery["archType"] = { _id: arcType._id, name: arcType.name };
      }
      saveData(row, calledQuery, "idea");
    }

    // NOTE set delayedBy/delayedStatus
    if (row.delayedBy || row.delayedStatus) {
      let curDate = date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss.SSSZ");
      const diff = date.getDateDiff(curDate, mlenddate, 'days');
      row.delayedState = (diff > 0) ? false : true;
      row.delayedBy = (diff > 0) ? `${diff} (Days)` : '-';
      row.delayedStatus = (diff > 0) ? 'Delayed' : 'OnTrack';
    }
  }
},

setColor = (v) => {
  if (v === "accept") {
    return "green";
  } else if (v === "red bin") {
    return "pink";
  } else if (v === "duplicate") {
    return "grey-9";
  } else if (v === "ireview") {
    return "blue-10";
  } else {
    return null; // or any default color
  }
};


const Sorting = () => {
  const dom = document.getElementById(this.uuid);
  const element = dom.querySelector("table tbody");

  const sortable = Sortable.create(element, {
    disabled: !this.draggable,
    onEnd: (event) => {
      const tmp = this.data[event.oldIndex];
      this.data[event.oldIndex] = this.data[event.newIndex];
      this.data[event.newIndex] = tmp;
    },
    onMove: (evt) => (evt.related.className === "ignore-elements q-tr" ? false : undefined),
  });
};


const downloadExcelreport = () => {
  this.toggleSpinner(true);
  setTimeout(async () => {
    if (!this.selected_prop.length) {
      this.$q.notify(
        `${this.$t("common.select")} ${this.$t("common.ideas")} ${this.$t("common.to_be")} ${this.$t("common.downloaded")}`
      );
      this.toggleSpinner(false);
      return;
    }
    /////////////////////////////////////////////////////////////////

    try {
      this.toimage = [];
      this.fromimage = [];
      const timeStamp = Date.now();
      const workbook = new ExcelJS.Workbook();
      const exceldata = _.value.cloneDeep(this.selected_prop);
      const temWkCode = _.value.map(exceldata, x => x.workshop);
      const currentdate = date.formatDate(timeStamp, `DD-MMM-YYYY  hh:mm a`);
      const workshopCode = _.value.uniq(
        _.value.filter(_.value.map(exceldata, 'wrkshpData._id'), res => res)
      );

      const ideaCurrentPicture = _.value.filter(
        _.value.map(exceldata, (row) => ({
          ..._.value.pick(row, ['_id']),
          currentPicture: _.value.pick(row.currentPicture, ['orignalName', 'newNameWithPath'])
        })),
        row => !_.value.has(row.currentPicture, 'base64') && row.currentPicture.newNameWithPath !== 'placeholder.jpg'
      );

      const ideaAfterPicture = _.value.filter(
        _.value.map(exceldata, (row) => ({
          ..._.value.pick(row, ['_id']),
          afterPicture: _.value.pick(row.afterPicture, ['orignalName', 'newNameWithPath'])
        })),
        row => !_.value.has(row.afterPicture, 'base64') && row.afterPicture.newNameWithPath !== 'placeholder.jpg'
      );

      const apiContent = {
        method: 'POST',
        mode: 'cors',
        headers: {
          'content-type': 'application/json',
          'x-feathers-jwt': `Bearer ${localStorage.getItem('vtl2.0')}`,
          authorization: `Bearer ${localStorage.getItem('authorization')}`,
          'x-tenant': localStorage.getItem('tenant')
        }
      };

      await fetch(`${process.env.API_BASE_URL}/idea-base64-from-s3`, {
        ...apiContent,
        body: JSON.stringify({ data: { idea: ideaCurrentPicture, field: 'currentPicture' } })
      }).then(r => r.json()).then(({ data }) => {
        _.value.forEach(data, idea => {
          const { currentPicture } = idea;
          const index = _.value.findIndex(exceldata, { _id: idea._id });
          if (index > -1 && currentPicture.base64) {
            exceldata[index].currentPicture.base64 = currentPicture.base64;
          }
        })
      }).catch(() => {
        this.toggleSpinner(false);
      })

      await fetch(`${process.env.API_BASE_URL}/idea-base64-from-s3`, {
        ...apiContent,
        body: JSON.stringify({ data: { idea: ideaAfterPicture, field: 'afterPicture' } })
      }).then(r => r.json()).then(({ data }) => {
        _.value.forEach(data, idea => {
          const { afterPicture } = idea;
          const index = _.value.findIndex(exceldata, { _id: idea._id });
          if (index > -1 && afterPicture.base64) {
            exceldata[index].afterPicture.base64 = afterPicture.base64;
          }
        })
      }).catch(() => {
        this.toggleSpinner(false);
      })

      if (_.value.includes(temWkCode, '-')) {
        workshopCode.push('-');
      }

              for (let c = 0; c < workshopCode.length; c++) {
                const exceldata1 = _.value.filter(
                  exceldata,
                  x => (x?.wrkshpData?._id === workshopCode[c]) || (x.workshop === workshopCode[c])
                );

                this.rowdata = [];
                this.columndata = [];

                const tempcol = Object.keys(exceldata1[0]);
                const columnnames = _.value.cloneDeep(this.columns);

                _.value.forEach(tempcol, col => {
                  if (col !== "role" && col !== "bulkAdd") {
                    this.columndata.push({ name: _.value.toUpper(col) });
                  }
                });

                _.value.forEach(exceldata1, row => {
                  let obj = [];
                  if (row.role) delete row.role;

                  Object.values(row).forEach((r, index) => {
                    if (index !== _.value.indexOf(tempcol, "bulkAdd")) {
                      if (r !== undefined && typeof r !== 'object' && !_.value.isArray(r)) {
                        obj.push(r);
                      } else if (r === undefined) {
                        obj.push("");
                      } else if (_.value.isArray(r)) {
                        obj.push(_.value.isArray(r[0]) || _.value.isObject(r[0]) ? _.value.map(r, x => x.name || x.email || x._id).join() : r.join());
                      } else if (_.value.isObject(r)) {
                        obj.push(r?.name || r?._id || r || "");
                      }
                    }
                  });
                  this.rowdata.push(obj);
                });

                // Set column and row attributes for the Excel sheet
                const alphabet = this.alphabetList(0, this.columndata.length);
                const wkCode = _.value.find(exceldata1, { wrkshpData: { _id: workshopCode[c] } });
                const sheet = workbook.addWorksheet(
                  workshopCode[c] === undefined || workshopCode[c] === "-" ? `IdeaLake-IdeaSheet${c}` : `${wkCode?.workshop || "IdeaLake"}-IdeaSheet${c}`,
                  {
                    properties: { tabColor: { argb: "FFFFFF" } },
                    views: [{ state: "frozen", activeCell: "A1", showGridLines: true }]
                  }
                );

                // Custom styling for header row
                sheet.getRow("1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "02011c" } };
                sheet.getRow("1").font = { name: "Arial", color: { argb: "ffffff" }, size: 10, bold: true };

                // Match column and row lengths
                _.value.forEach(this.rowdata, x => {
                  if (this.columndata.length < x.length) {
                    x.splice(this.columndata.length);
                  }
                });

                // Additional adjustments and logic for specific columns and milestones (continue as in original code)...
              }
            } catch (error) {
              this.$q.notify(`Error downloading report: ${error}`);
            } finally {
              this.toggleSpinner(false);
            }
          }, 100);
};

selectedRowsTagITrack = () => {
              if (!selectedProp.value.length) {
                $q.notify(`${$q.i18n.t("common.select")} ${$q.i18n.t("common.ideas")}`);
                return;
              }

              selectedProp.value.forEach((x) => {
                if (x.tag === "accept") {
                  x.tag = "ireview";
                }
              });

              let batchUpdateData = [];
              selectedProp.value.map((x) => {
                batchUpdateData.push(["idea::patch", { _id: x._id, tag: x.tag }]);
              });

              if ($q.checkIsSuperAdminHasAccess(user.value.role, this)) {
                toggleSpinner(true);
                new useApi.Batch({ call: batchUpdateData })
                  .save()
                  .then(() => toggleSpinner(false))
                  .catch(() => toggleSpinner(false));
              } else {
                toggleSpinner(false);
              }
};

const getWorkshopById = (callback) => {
              const query = {
                _id: { $in: _.value.map(_.value.cloneDeep(selectedProp.value), "wrkshpData._id") },
              };

              const { data, total } = useApi.Workshop.findInStore({ query });

              if (total) {
                callback({ data, total });
              } else {
                useApi.Workshop.find({ query }).then(callback);
              }
};

const toggleSpinner = (isLoading) => {
              // implement the logic for showing and hiding spinner
};


/////////////////////////////////////////////////////////////////////////

const downloadpptreport = () => {
          const $q = useQuasar()
          const selected_prop = ref([])  // Assuming selected_prop is a reactive ref

          if (!selected_prop.value.length) {
            $q.notify(
              `${$q.lang.get('common.select')} ${$q.lang.get('common.ideas')} ${$q.lang.get('common.to_be')} ${$q.lang.get('common.downloaded')}`
            )
            return
          }

        ///////////////////////////////////////////////////////////////////

        toggleSpinner(true)

          try {
  const propdata2 = _.value.cloneDeep(selected_prop);
  const calback = (response) => {
    if (response) {
      objWorkeshop.value = response.data;
      let timeStamp = Date.now();
      var currentdate = date.formatDate(timeStamp, `DD-MMM-YYYY  hh:mm a`);
      if (selected_prop.value.length) {
        let workshopCode = _.value.uniq(
        _.value.map(_.value.cloneDeep(propdata2), (x) => x.wrkshpData && x.wrkshpData._id).filter((res) => res)
        );

        const temWkCode = _.value.map(_.value.cloneDeep(propdata2), (x) => x.workshop);

        if (_.value.includes(temWkCode, '-')) {
          workshopCode.push('-');
        }

        for (let c = 0; c < workshopCode.length; c++) {
          let propdata = _.value.filter(
          _.value.cloneDeep(propdata2),
          (x) => (
          (x && x.wrkshpData && (x.wrkshpData._id === workshopCode[c])) ||
          (x.workshop === workshopCode[c])
          )
          );
          let workshop = [];
          let primaryvar = ["Benchmark"];
          let secvar = ["Saving"];

          if (workshopCode[c] !== "-") {
            workshop = objWorkeshop.value.length
            ? objWorkeshop.value.filter((x) => x ? x._id === propdata[0].wrkshpData._id : "")
            : [];
            primaryvar = workshop.length
            ? workshop[0].icfConfig.primVariable
            .map((y) => y.name)
            .filter(
            (x) =>
            x.toLowerCase().includes("benchmark") ||
            x.toLowerCase().includes("idea")
            )
            : ["Benchmark"];
            secvar = workshop.length
            ? workshop[0].icfConfig.secVariable
            .map((y) => y.name)
            .filter(
            (x) =>
            x.toLowerCase().includes("saving") ||
            x.toLowerCase().includes("time") ||
            x.toLowerCase().includes("investment")
            )
            : ["Saving"];
            
            if (workshop.length) {
              primaryvar.push(
              workshop[0].icfConfig.primVariable
              .map((y) => y.name)
              .filter(
              (x) =>
              !x.toLowerCase().includes("benchmark") &&
              !x.toLowerCase().includes("idea")
              )
              );
              secvar.push(
              workshop[0].icfConfig.secVariable
              .map((y) => y.name)
              .filter(
              (x) =>
              !x.toLowerCase().includes("saving") &&
              !x.toLowerCase().includes("time") &&
              !x.toLowerCase().includes("investment")
              )
              );
              primaryvar = primaryvar.flat();
              secvar = secvar.flat();
            }
          }
          var pptx = new PptxGenJS();
          pptx.setAuthor("DDTV"); // dynamic put username
          pptx.setCompany("Mckinsey"); // dynamic put username
          pptx.setTitle(`Idea Report`);
          pptx.setLayout("LAYOUT_WIDE");
          let slidenames = [];
          for (let i = 0; i < propdata.length; i++) {
            slidenames.push(`slide${i + 1}`);
            const slide = pptx.addNewSlide(slidenames[i]);
            slide.addText(
            columns.value.filter((x) => x.name === "title")[0].label,
            {
              x: 0.4,
              y: 0.3,
              w: "99%",
              h: 0.19,
              color: "163051",
              fontSize: 20,
              fill: "",
              bold: true,
            }
            );
            slide.addText(propdata[i].title.trim().slice(0, 200), {
              x: 2.18,
              y: 0.3,
              w: "99%",
              h: 0.19,
              color: "163051",
              fontSize: 20,
              fill: "",
              bold: true,
            });
            
            // Product
            if (propdata[i].productId) {
              slide.addText("Product:", {
                shape: pptx.shapes.RECTANGLE,
                align: "l",
                x: 0.4,
                y: 0.7,
                w: "15%",
                h: 0.4,
                color: "FFFFFF",
                fontSize: 12,
                fill: "1a63a3",
                line: "",
              });
              slide.addText(propdata[i].productId, {
                shape: pptx.shapes.RECTANGLE,
                align: "c",
                x: 2.9,
                y: 0.7,
                w: "25%",
                h: 0.4,
                fill: "FFFFFF",
                line: "000000",
                lineSize: 0.5,
                fontSize: 12,
              });
            }
            
            // Aggregate
            if (
            propdata[i].aggregateId &&
            propdata[i].aggregateId !== "-"
            ) {
              slide.addText("Aggregate:", {
                shape: pptx.shapes.RECTANGLE,
                align: "l",
                x: 0.4,
                y: 1.25,
                w: "15%",
                h: 0.4,
                color: "FFFFFF",
                fontSize: 12,
                fill: "1a63a3",
                line: "",
              });
              slide.addText(propdata[i].aggregateId, {
                shape: pptx.shapes.RECTANGLE,
                align: "c",
                x: 2.9,
                y: 1.25,
                w: "25%",
                h: 0.4,
                fill: "FFFFFF",
                line: "000000",
                lineSize: 0.5,
                fontSize: 12,
              });
            }
            
            // Sub-Aggregate
            if (
            propdata[i].subAggregateId &&
            propdata[i].subAggregateId !== "-"
            ) {
              slide.addText("Sub-Aggregate:", {
                shape: pptx.shapes.RECTANGLE,
                align: "l",
                x: 0.4,
                y: 1.75,
                w: "15%",
                h: 0.4,
                color: "FFFFFF",
                fontSize: 12,
                fill: "1a63a3",
                line: "",
              });
              slide.addText(propdata[i].subAggregateId, {
                shape: pptx.shapes.RECTANGLE,
                align: "c",
                x: 2.9,
                y: 1.75,
                w: "25%",
                h: 0.4,
                fill: "FFFFFF",
                line: "000000",
                lineSize: 0.5,
                fontSize: 12,
              });
            }
            
            // Part
            if (propdata[i].partName && propdata[i].partName !== "-") {
              slide.addText("Part:", {
                shape: pptx.shapes.RECTANGLE,
                align: "l",
                x: 0.4,
                y: 2.25,
                w: "15%",
                h: 0.4,
                color: "FFFFFF",
                fontSize: 12,
                fill: "1a63a3",
                line: "",
              });
              slide.addText(propdata[i].partName, {
                shape: pptx.shapes.RECTANGLE,
                align: "c",
                x: 2.9,
                y: 2.25,
                w: "25%",
                h: 0.4,
                fill: "FFFFFF",
                line: "000000",
                lineSize: 0.5,
                fontSize: 12,
              });
            }
            
            // Primary Variables
            if (primaryvar.length) {
              primaryvar.forEach((ele, ix) => {
                let element = ele;
                slide.addText(element, {
                  shape: pptx.shapes.RECTANGLE,
                  align: "l",
                  x: 6.8,
                  y: 0.7 + ix * 0.55,
                  w: "17.5%",
                  h: 0.4,
                  color: "FFFFFF",
                  fontSize: 12,
                  fill: "1a63a3",
                  line: "",
                });
                element = ele && ele.toLowerCase().replace(/ /g, "_");
                slide.addText(propdata[i][element], {
                  shape: pptx.shapes.RECTANGLE,
                  align: "c",
                  x: 9.7,
                  y: 0.7 + ix * 0.55,
                  w: "26.5%",
                  h: 0.4,
                  fill: "FFFFFF",
                  line: "000000",
                  lineSize: 0.5,
                  fontSize: 12,
                });
              });
            }
            
            // Idea Concept Box (image box)
            slide.addText("Idea Concept", {
              shape: pptx.shapes.RECTANGLE,
              align: "l",
              x: 0.4,
              y: 3.1,
              w: "65%",
              h: 0.3,
              fill: "1a63a3",
              fontSize: 14,
              color: "FFFFFF",
              bold: true,
              line: "1a63a3",
              lineSize: 1,
            });
            slide.addShape(pptx.shapes.RECTANGLE, {
              x: 0.4,
              y: 3.4,
              w: "65%",
              h: 3.6,
              fill: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
            });
            
            // Add Image or Placeholder
            if (
            propdata[i] &&
            propdata[i].currentPicture &&
            propdata[i].currentPicture.signedUrl
            ) {
              slide.addImage({
                path: propdata[i].currentPicture.signedUrl,
                x: 0.8,
                y: 4.3,
                w: 2.5,
                h: 2.5,
              });
            } else {
              slide.addImage({
                data: `${getFileType("placeholder.JPG")};base64,${placeHolderBase64}`,
                x: 0.8,
                y: 4.3,
                w: 2.5,
                h: 2.5,
              });
            }
            if (propdata[i] && propdata[i].afterPicture && propdata[i].afterPicture.signedUrl) {
              slide.addImage({
                path: propdata[i].afterPicture.signedUrl,
                x: 6.2,
                y: 4.3,
                w: 2.5,
                h: 2.5,
              });
            } else {
              slide.addImage({
                data: `${getFileType("placeholder.JPG")};base64,${placeHolderBase64.value}`,
                x: 6.2,
                y: 4.3,
                w: 2.5,
                h: 2.5,
              });
            }
            slide.addShape(pptx.shapes.UP_ARROW, {
              rotate: 90,
              align: "c",
              x: 3.6,
              y: 5.4,
              w: 2.2,
              h: 0.5,
              fill: "1a63a3",
              line: "1a63a3",
              lineSize: 1,
            });
            slide.addText("From(Current Design)", {
              align: "l",
              x: 0.7,
              y: 3.7,
              h: 0.3,
              fontSize: 14,
              color: "002960",
              bold: true,
            });
            slide.addText("To(Proposed Design)", {
              align: "l",
              x: 6.2,
              y: 3.7,
              h: 0.3,
              fontSize: 14,
              color: "002960",
              bold: true,
            });
            slide.addText("", {
              shape: pptx.shapes.line,
              x: 0.8,
              y: 4,
              w: 2,
              fill: "1a63a3",
              line: "1a63a3",
              lineSize: 1,
            });
            slide.addText("", {
              shape: pptx.shapes.line,
              x: 6.3,
              y: 4,
              w: 2,
              fill: "1a63a3",
              line: "1a63a3",
              lineSize: 1,
            });
            // 2nd column  (saving  timeline idea description) :774- :792
            slide.addText(
            columns.value.filter((x) => x.name === "Saving")[0].label,
            {
              x: 9.5,
              y: 3.1,
              w: "13.2%",
              h: 0.3,
              fill: "1a63a3",
              color: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 13,
              bold: true,
            }
            );
            slide.addText(propdata[i].saving, {
              shape: pptx.shapes.RECTANGLE,
              align: "c",
              x: 9.5,
              y: 3.4,
              w: "13.2%",
              h: 0.3,
              fill: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 17,
            });
            let investmentval = secvar.filter((x) => x.toLowerCase().includes("investment"));
            investmentval = investmentval.length
            ? investmentval[0]
            : secvar.filter(
            (z) =>
            !z.toLowerCase().includes("saving") &&
            !z.toLowerCase().includes("investment") &&
            !z.toLowerCase().includes("time")
            )[0];
            slide.addText(investmentval, {
              shape: pptx.shapes.RECTANGLE,
              align: "c",
              x: 11.42,
              y: 3.1,
              w: "13.45%",
              h: 0.3,
              fill: "1a63a3",
              color: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 10,
              bold: true,
            });
            investmentval =
            investmentval && investmentval.toLowerCase().replace(/ /g, "_");
            slide.addText(propdata[i][investmentval], {
              shape: pptx.shapes.RECTANGLE,
              align: "c",
              x: 11.42,
              y: 3.4,
              w: "13.2%",
              h: 0.3,
              fill: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 13,
            });
            let reqtime = secvar.filter((x) => x.toLowerCase().includes("time"));
            reqtime = reqtime.length
            ? reqtime[0]
            : secvar.filter(
            (z) =>
            !z.toLowerCase().includes("saving") &&
            !z.toLowerCase().includes("time")
            );
            reqtime =
            _.value.isArray(reqtime) &&
            reqtime.length > 1 &&
            _.value.includes(
            reqtime.map((x) => x.toLowerCase().includes("investment")),
            true
            )
            ? reqtime[1]
            : _.value.isArray(reqtime) &&
            reqtime.length &&
            reqtime[0] === investmentval
            ? reqtime[1]
            : _.value.isArray(reqtime) && reqtime.length
            ? reqtime[0]
            : !_.value.isArray(reqtime) && reqtime.length && reqtime.toLowerCase().includes("time")
            ? reqtime
            : "-";
            slide.addText(reqtime, {
              shape: pptx.shapes.RECTANGLE,
              align: "c",
              x: 9.5,
              y: 3.95,
              w: "27.5%",
              h: 0.3,
              color: "FFFFFF",
              fill: "1a63a3",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 14,
              bold: true,
            });
            reqtime = reqtime && reqtime.toLowerCase().replace(/ /g, "_");
            slide.addText(propdata[i][reqtime], {
              shape: pptx.shapes.RECTANGLE,
              align: "c",
              x: 9.5,
              y: 4.25,
              w: "27.5%",
              h: 0.3,
              fill: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 13,
            });
            slide.addText(this.$t("itrack.ideaDesc").slice(0, 400), {
              shape: pptx.shapes.RECTANGLE,
              align: "c",
              x: 9.5,
              y: 4.7,
              w: "27.5%",
              h: 0.3,
              fill: "1a63a3",
              color: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 14,
              bold: true,
            });
            slide.addText(propdata[i].description, {
              shape: pptx.shapes.RECTANGLE,
              align: "j",
              x: 9.5,
              y: 5.1,
              w: "27.5%",
              h: 1.9,
              fill: "FFFFFF",
              line: "1a63a3",
              lineSize: 1,
              fontSize: 10,
            });
            slide.addText(`Workshop code:  ${propdata[i].workshop}`, {
              x: 0.4,
              y: 7.2,
              w: "25%",
              h: 0.2,
              color: "000000",
              fontSize: 10,
              align: "l",
            });
            slide.addText(`McKinsey & Company | ${i + 1}`, {
              x: 11.6,
              y: 7.2,
              w: "30%",
              h: 0.2,
              color: "000000",
              fontSize: 10,
              align: "l",
            });
          }
          const wkCode = _.value.find(propdata, {
            wrkshpData: { _id: workshopCode[c] },
          });
          let ppttitle =
          workshopCode[c] === "-" ? "Idea lake" : wkCode.workshop;
          pptx.save(
          `${ppttitle} ${column_options_selected.value["productId"]} idea ppt ${currentdate}`
          );
          nextTick(() => {
            toggleSpinner(false);
          });
        }
      }
    }
  }
    getWorkshopById(calback);
  } catch (error) {
    toggleSpinner(false);
  }
};
</script>

<style>
.my-sticky-dynamic {
  /* height or max-height is important */
  font-size: 1.15em;
  font-family: calibri, arial;
  overflow: auto;
}

.my-table-details {
  font-size: 1.15em;
  max-width: 400px;
  /* height: 150px; */
  /* white-space: normal !important; */
  margin-top: 4px !important;
  overflow: hidden;
  white-space: nowrap !important;
  text-overflow: ellipsis;
  width: 120px;
  display: inline-block;
  height: unset;
}

/*.my-table-details-tooltip {
    font-size: 1em;
    max-width: 400px;
    overflow-wrap: break-word;
    white-space: normal !important;
    margin-top: 4px !important;
}*/

.customStyle {
  font-size: 9px !important;
}

.zoom {
  zoom: 0.8;
}

</style>


