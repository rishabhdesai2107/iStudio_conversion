<template>
  <div class="q-pa-xs">
    <i-studio-grid
      flat
      :dense="true"
      :mvItrack="mvItrack"
      :title="$t('ibase.ideaLake')"
      :data="loadIdeaData"
      :hideAction="hideAction"
      :columns="columns"
      :columns_filter="true"
      :draggable="true"
      :header_filter="false"
      file_name="workshopList"
      :ppt_download="true"
      :excel_download="true"
      :selection="'multiple'"
      :role="user.role"
      :columnState="stateSavedColumn"
      :module="module"
      :loader="loader"
      :show-refetch="true"
      @rowEdit="openWs"
      @visibleColumns="setTableState"
      @rowDelete="deleteIdea"
      @updateTag="autoSaveTag"
      @construct-filter="addRemoveFilters"
      @virtual-scroll="virtualScroll"
      @refetch-data="refresh"
    />

    <q-dialog maximized v-model="showEditIdea">
      <q-card>
        <q-bar style="height: 30px" class="bg-primary text-white">
          <q-icon size="sm" name="wifi_tethering" />
          <q-item-label class="text-subtitle1 text-bold">{{
            $t("ibase.ideaCapForm")
          }}</q-item-label>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>{{ $t("common.close") }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <i-studio-icf
            v-if="objWorkeshop._id || getIdeaForEdit"
            :wk="objWorkeshop"
            :bulkAdd="bulkAdd"
            :idea="getIdeaForEdit"
            @idea-saved="showEditIdea = false"
            @ideaPatchedEvent="ideaUpdatedEvent"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

import ideaBase64 from "@/mixins/idea-base64";
import { setTableState, getTableState } from "@/utils/StateSaveHelper";

export default {
  mixins: [ideaBase64],
  props: {
    mvItrack: {
      type: Boolean,
      default: true
    },
    hideAction: {
      type: Boolean,
      default: false
    },
    getIlake: {
      type: Object,
      default: () => ({})
    },
    module: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      totalPageCount: 0,
      totalNumberOfIdea: 0,
      ideaData: {},
      workshopListCC: [],
      bulkAdd: false,
      showEditIdea: false,
      objWorkeshop: {},
      columns: [],
      ideaRowData: [],
      listOfWkIds: [],
      stateSavedColumn: [],
      events: [],
      lastPage: 0,
      ideaCount: 0,
      ideas: [],
      loader: false,
      limit: 500,
      skip: 0,
      userFilterQuery: {},
      listOfIdeas: []
    };
  },
  components: {
    'i-studio-icf': () => import("./iStudioIcf.vue"),
    'i-studio-grid': () => import("./iStudioGrid2table.vue")
  },
  computed: {
    ...mapGetters(["roles"]),
    ...mapGetters("VTL", ['user', 'getSelChargeCode', 'getCurrentChargeCode']),
    ...mapState('idea', { ideaFindPending: 'isFindPending' }),
    ...mapGetters("idea", {
      findIdeaInStore: 'find',
      ideaRemoved: "removed"
    }),
    ideaList() {
      return this.listOfIdeas
    },
    filterQuery() {
      return this.userFilterQuery
    },
    ideaParams() {
      return {
        query: {
          $limit: this.limit,
          $skip: this.skip,
          ...this.findIdeaQuery,
          ...this.userFilterQuery
        },
        paginate: false
      }
    },
    getIdeaForEdit() {
      return this.ideaData
    },
    findIdeaQuery() {
      const query = {
        'chargeCode._id': this.getSelChargeCode
      }

      if (
        !this.getCurrentChargeCode.showAllIdea &&
        !_.includes(this.roles, 'Admin') &&
        !_.includes(this.roles, 'Super Admin')
      ) {
        query['createdBy'] = this.user?._id
      }

      if(!_.includes(this.roles, 'Super Admin')) {
        query['$or'] = [
          { 'workshop._id': { $in: _.map(_.cloneDeep(this.workshopListCC), '_id') }},
          { createdBy: this.user?._id }
        ]
      }

      // NOTE Need to all idea irrespective of who created it
      if (this.getIlake.hasOwnProperty('_id')) {
        if (this.getIlake && this.getIlake.level._id === 2) {
          query['aggregateId._id'] = this.getIlake._id;
        } else {
          query['productId._id'] = this.getIlake._id; // get product_id from prop can be default
        }
      }

      return query
    },
    tableColumns() {
      return [
        {
          name: "index",
          align: "center",
          label: this.$t("common.seqNo"),
          field: "index",
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "_id",
          align: "center",
          label: 'Add/Edit mockups',
          field: "_id",
          format: (val) => `${val}`,
        },
        {
          name: "ideaNum",
          align: "center",
          label: this.$t("itrack.ideaNumber"),
          field: "ideaNum",
          search: (val, clear) => this.constructSearch(val, clear, 'ideaNum'),
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "workshop",
          label: this.$t("common.workshopCode"),
          align: "left",
          field: "workshop",
          search: (val, clear) => this.constructSearch(val, clear, 'workshop.name'),
          format: (val) => `${val}`,
          // filter_type: "select",
        },
        {
          name: "productId",
          align: "center",
          label: this.$t("common.model"),
          field: "productId",
          search: (val, clear) => this.constructSearch(val, clear, 'productId.name'),
          format: (val) => `${val}`,
          // filter_type: "select"
        },
        {
          name: "aggregateId",
          align: "center",
          label: this.$t("common.aggregate"),
          field: "aggregateId",
          search: (val, clear) => this.constructSearch(val, clear, 'aggregateId.name'),
          format: (val) => `${val}`,
          // filter_type: "select",
        },
        {
          name: "subAggregateId",
          align: "center",
          label: this.$t("common.subAggregate"),
          field: "subAggregateId",
          search: (val, clear) => this.constructSearch(val, clear, 'subAggregateId.name'),
          format: (val) => `${val}`,
          // filter_type: "select",
        },
        {
          name: "partName",
          align: "center",
          label: this.$t("common.part"),
          field: "partName",
          search: (val, clear) => this.constructSearch(val, clear, 'partName.name'),
          format: (val) => `${val}`,
          // filter_type: "select",
        },
        {
          name: "title",
          align: "center",
          label: this.$t("itrack.ideaTitle"),
          field: "title",
          search: (val, clear) => this.constructSearch(val, clear, 'title'),
          format: (val) => `${val}`,
          classes: "ellipsis",
        },
        {
          name: "description",
          align: "center",
          label: this.$t("itrack.ideaDesc"),
          search: (val, clear) => this.constructSearch(val, clear, 'description'),
          field: "description",
          format: (val) => `${val}`
        },
        {
          name: "createdByUser",
          label: this.$t("common.createdBy"),
          field: "createdByUser",
          sortable: true,
        },
        {
          sortable: true,
          name: "updatedBy",
          label: this.$t("common.updatedBy"),
          field: "updatedBy"
        },
        {
          name: "currentPicture",
          align: "center",
          label: this.$t("iworkshop.fromImg"),
          field: "currentPicture",
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "afterPicture",
          align: "center",
          label: this.$t("iworkshop.toImg"),
          field: "afterPicture",
          format: (val) => `${val}`,
          sortable: true,
        },
      ]
    },
    loadIdeaData() {
      let tblColData = _.cloneDeep(this.tableColumns);

      if (!this.roles.some((el) => _.includes(["Admin", "Super Admin"], el))) {
        tblColData = _.filter(tblColData, (x) => x.name !== "tag");
      }

      // get all workshop and create columns from unique keys
      let varColArr = [];
      this.ideaRowData = [];
      let icfVariables = [];
      let rowTblRowData = [];
      let rowDataIdeas = _.map(
        _.filter(_.cloneDeep(this.ideaList), (idea) => idea),
        (idea, index) => {
          idea['index'] = (index + 1)
          return idea
        }
      );

      let priVar
      let secVar

      if (rowDataIdeas.length) {
        if (this.workshopListCC.length) {
          icfVariables = this.workshopListCC.map((x) => x.icfConfig);
          priVar = _.uniqBy(
            icfVariables
              .map((x) =>
                x.primVariable.map((v) => {
                  let obj = {
                    ["name"]: v.name,
                    ["unit"]: `${
                      _.isObject(v.unit)
                        ? v.unit.name
                        : v.unit === undefined
                        ? ""
                        : v.unit
                    }`,
                  };
                  return obj;
                })
              )
              .flat(),
            "name"
          );

          secVar = _.uniqBy(
            icfVariables
              .map((x) =>
                x.secVariable.map((v) => {
                  let obj = {
                    ["name"]: v.name,
                    ["unit"]: `${
                      _.isObject(v.unit)
                        ? v.unit.name
                        : v.unit === undefined
                        ? ""
                        : v.unit
                    }`,
                  };
                  return obj;
                })
              )
              .flat(),
            "name"
          );
          varColArr = [...priVar, ...secVar];
        } else {
          priVar = rowDataIdeas[0].primVariable
          secVar = rowDataIdeas[0].secVariable
          varColArr = [...priVar, ...secVar];
        }
      }

      _.forEach(varColArr, (v) => {
        let colObj = {
          name: v.name,
          align: "center",
          label: v.unit
            ? `${v.name}[${v.unit.name ? v.unit.name : v.unit}]`
            : v.name,
          field: v?.name?.toLowerCase()?.replace(/ /g, "_"),
          format: (val) => `${val}`,
          search: (val, clear) => {
            let filter = {}

            this.$nextTick(() => {
              const queryObj = _.isArray(val) ? { $in: _.map(val, (v) => new RegExp(`\^${v}`, 'i')) } : { $regex: val, $options: 'i' }

              if (_.find(priVar, { name: v.name })) {
                filter = { $or: [{ 'primVariable.name': queryObj }, { 'primVariable.unit': queryObj }, { 'primVariable.value': queryObj }] }
              }

              if (_.find(secVar, { name: v.name })) {
                filter = { $or: [{ 'secVariable.name': queryObj }, { 'secVariable.unit': queryObj }, { 'secVariable.value': queryObj }] }
              }

              if (clear) {
                this.userFilterQuery = Object.assign({}, _.omit(this.userFilterQuery, ['$or']))
              } else {
                const query = _.isArray(val) ? { $in: val } : val
                this.userFilterQuery = Object.assign({}, this.userFilterQuery, filter)
              }
            })
          }
        };
        tblColData.push(colObj);
      });

      _.forEach(rowDataIdeas, (x) => {
        let array = []

        if (x) {
          if (x.primVariable) {
            array.push(...x.primVariable)
          }
          if (x.secVariable) {
            array.push(...x.secVariable)
          }
          _.forEach(array, (v, index) => {
            if (_.isArray(v.value)) {
              if (v.value && v.value.length) {
                if (_.every(v.value, _.isObject))
                  x[v?.name?.toLowerCase()?.replace(/ /g, "_")] = _.toString(
                    _.map(v.value, "name")
                  );
                else
                  x[v?.name?.toLowerCase()?.replace(/ /g, "_")] = _.toString(
                    v.value
                  );
              } else x[v?.name?.toLowerCase()?.replace(/ /g, "_")] = "-";
            } else if (_.isObject(v.value)) {
              x[v?.name?.toLowerCase()?.replace(/ /g, "_")] = v.value
                ? v.value.name
                : "-";
            } else {
              x[v?.name?.toLowerCase()?.replace(/ /g, "_")] = v.value;
            }
          });
        }
      });

      this.columns = _.uniqBy(tblColData, "name");
      let colKeys = _.map(this.columns, (x) => x.field);
      const placeholderImage = {
        path: "placeholder.jpg",
        orignalName: "placeholder.jpg",
        base64: this.$placeHolderBase64,
        newNameWithPath: "placeholder.jpg",
      };

      _.forEach(rowDataIdeas, (x, index) => {
        if (x) {
          if (x?.secVariable) {
            delete x.secVariable;
          }
          if (x?.primVariable) {
            delete x.primVariable;
          }
          let rowObj = {};
  
          _.forEach(colKeys, (c, i) => {
            if (c === "index") {
              rowObj[c] = index + 1;
            } else if (c === "tag") {
              rowObj[c] = x.tag;
            } else if (c === "currentPicture") {
              let img = x[c][0];
              rowObj[c] = img?.signedUrl ? img : placeholderImage;
            } else if (c === "afterPicture") {
              let img = x[c][0];
              rowObj[c] = img?.signedUrl ? img : placeholderImage;
            } else {
              if (_.isObject(x[c])) {
                if (x[c] === undefined || x[c] === null) {
                  rowObj[c] = "-";
                } else {
                  if (x[c].name === undefined) {
                    rowObj[c] = "-";
                  } else rowObj[c] = x[c].name;
                }
              } else if (x[c] === undefined || x[c] === null) {
                rowObj[c] = "-";
              } else rowObj[c] = x[c];
            }
            if (_.has(x, 'createdByUser') && c === 'createdByUser') {
              rowObj[c] = x.createdByUser?.email;
              rowObj['role'] = x.createdByUser?.role;
            }
            if (_.has(x, 'updatedBy') && c === 'updatedBy') {
              rowObj[c] = x.updatedBy?.email;
            }
          });
  
          rowObj["_id"] = x._id;
          rowObj["wrkshpData"] = x.workshop;
  
          rowObj["bulkAdd"] = x.bulkAdd ? x.bulkAdd : false;
          rowTblRowData.push(rowObj);
        }
      });

      this.ideaRowData = rowTblRowData;
      Object.freeze(this.ideaRowData)

      return _.map(_.orderBy(rowTblRowData, '_id'), (idea, index) => {
        idea["index"] = index + 1;
        return idea
      })
    }
  },
  watch: {
    getSelChargeCode() {
      this.ideaCount = 0;
      this.listOfIdeas = []
      this.userFilterQuery = {}
      this.toggleSpinner(true);
      this.totalPageCount = 0
      this.getWorkshopListByCC();
    },
    ideaRemoved: {
      handler: function (idea) {
        if (idea.updatedBy !== this.user._id) {
          this.removedIdeaEvent(newValue);
        }
      },
      deep: true,
    }
  },
  created() {
    this.toggleSpinner(true);
    const { items } = getTableState("workshop-manage-idea");

    if (items && items["workshop-manage-idea"]) {
      this.stateSavedColumn = items["workshop-manage-idea"];
    }

    this.loader = true
    this.getWorkshopListByCC();
  },
  methods: {
    ...mapMutations("VTL", ["toggleSpinner"]),
    ideaUpdatedEvent(idea) {
      console.log({ idea })

      if (!_.isEmpty(idea)) {
        const index = _.findIndex(this.listOfIdeas, { _id: idea._id });
        const tableDataIndex = _.findIndex(this.loadIdeaData, { _id: idea._id });

        if (index > -1) {
          this.$set(this.listOfIdeas, index, {
            ..._.merge(this.listOfIdeas[index], _.omit(idea, ['createdByUser'])),
            updatedByData: idea?.updated,
            updatedBy: idea?.updated?.email,
            createdByUser: idea?.created?.email
          })
        }
        if (tableDataIndex > -1) {
          this.$set(this.loadIdeaData, tableDataIndex, {
            ...this.loadIdeaData[tableDataIndex],
            updatedBy: idea?.updated?.email,
            createdByUser: idea?.created?.email,
          })
        }
      }
    },
    getFileType(filename) {
      if(filename) {
        const ext = _.toLower(filename.split('.')?.pop())
        const imageType = ['png', 'gif', 'jpeg', 'webp', 'jpg', 'jfif']
        const videoType = ['webm', 'mp4', 'avi', 'webm', 'ogg']
        const audioType = [
          'mpeg', 'vorbis', 'midi', 'x-midi',
          'mpeg', 'webm', 'wav', 'x-aac',
          'mp4', 'mp3', 'webm', 'ogg'
        ]
  
        if(_.includes(imageType, ext)) return `image/${ext}`
        if(_.includes(audioType, ext)) return `audio/${ext}`
        if(_.includes(videoType, ext)) return `video/${ext}`
  
        return `application/${ext}`
      }

      return `application/jpg`
    },
    refresh() {
      this.toggleSpinner(true)
      this.getIdeaCount()
    },
    virtualScroll(data) {
      const { index, from, to, direction } = data

      if (
        index && // NOTE Index must not to be '0'
        !this.ideaFindPending &&
        (direction === 'increase') &&
        ((index + 1) === this.ideaList.length) && // NOTE Index table data count length same
        (index !== this.totalNumberOfIdea - 1) && // NOTE Index And total idea count same skip the request
        (index + 1) < (this.totalNumberOfIdea - 1) // NOTE Index must be less than total idea count
      ) {
        this.loader = true
        this.skip = index + 1
        const { query } = this.ideaParams
        this.findIdea(query)
      }
    },
    findIdea(query) {
      if (this.ideaList.length === this.totalNumberOfIdea) {
        this.toggleSpinner(false)
        setTimeout(() => {
          this.loader = false
        }, 700);
        return
      }

      this.$store.dispatch('idea/find', { query })
        .then(({ total, data }) => {
          this.listOfIdeas = _.unionBy([..._.cloneDeep(this.ideaList), ...data], '_id')
          this.totalNumberOfIdea = total
          this.toggleSpinner(false)
          setTimeout(() => {
            this.loader = false
          }, 500);
        })
    },
    constructSearch(val, clear, field) {
      if (clear) {
        this.userFilterQuery = Object.assign({}, _.omit(this.userFilterQuery, [field]))
      } else {
        const query = _.isArray(val) ? { $in: _.map(val, (v) => new RegExp(`\^${v}`, 'i')) } : { $regex: val, $options: 'i' }
        this.userFilterQuery = Object.assign({}, this.userFilterQuery, { [field]: query })
      }

      this.$nextTick(() => {
        this.getIdeaCount() // NOTE Get count based on the applied filter
      })
    },
    addRemoveFilters({ field, value, clear, options }) {
      const column = (
        _.find(_.cloneDeep(this.columns), { field }) ||
        _.find(_.cloneDeep(this.columns), { field: field && field.toLowerCase().replace(/ /g, "_") })
      )

      if (options) {
        value = _.map(_.filter(options, (row) => _.includes(value, row.value)), 'label')
      }

      if (column && 'search' in column) {
        if (clear || _.isEmpty(value)) {
          column.search(value, true)
        } else {
          column.search(value)
        }
      }
    },
    getIdeaCount() {
      const { query } = this.ideaParams
      this.$store.dispatch('idea/find', { query: { ..._.omit(query, ['$skip', '$limit']), $limit: 0 } })
        .then(({ total }) => {
          if (total === 0) {
            this.loader = false
            this.toggleSpinner(false)
          }

          this.totalNumberOfIdea = total
          const { query } = this.ideaParams
          this.findIdea(query)
        })
    },
    removedIdeaEvent(idea) {
      if (idea && this.$api.Idea.getFromStore(idea._id)) {
        this.$store.commit('idea/removeItem', idea)
      }
    },
    autoSaveTag(data) {
      const { _id, tag } = data;

      if (tag === "delete") {
        this.$confirmBox(this, {
          message: this.$t("iworkshop.deleteIdea"),
        }).onOk(() => {
          if (this.$checkIsSuperAdminHasAccess(this.user.role, this)) {
            this.toggleSpinner(true);
            this.$store.dispatch('idea/remove', _id)
              .then(() => {
                this.toggleSpinner(false);
              }).catch(() => {
                this.toggleSpinner(false)
              });
          } else {
            this.toggleSpinner(false);
          }
        }).onCancel(() => {
          this.$store.dispatch('idea/get', _id)
            .then(() => {
              const index = _.findIndex(this.ideaRowData, ["_id", _id]);
              this.ideaRowData[index]["tag"] = idea["tag"];
            });
        });
      } else {
        if (this.$checkIsSuperAdminHasAccess(this.user.role, this)) {
          this.$store.dispatch("idea/patch", [_id, { tag }]);
        }
      }
    },
    setTableState(val) {
      setTableState(val, "workshop-manage-idea");
    },
    deleteIdea(_id) {
      this.$confirmBox(this, {
        message: this.$t("iworkshop.deleteIdea"),
      }).onOk(() => {
        if (this.$checkIsSuperAdminHasAccess(this.user.role, this)) {
          this.toggleSpinner(true)
          this.$store.dispatch('idea/remove', _id)
            .then(() => {
              this.totalNumberOfIdea--
              this.$store.commit('idea/removeItem', _id)
              this.listOfIdeas = _.reject(_.cloneDeep(this.ideaList), { _id })
            }).then(() => {
              this.toggleSpinner(false)
            }).catch(() => {
              this.toggleSpinner(false)
            })
        }
      });
    },
    getWorkshopById(callBack = () => {}) {
      this.$api.Workshop.get(this.workshopId).then((workshop) => {
        this.objWorkeshop = _.cloneDeep(workshop);
        this.showEditIdea = true;
        callBack(_.cloneDeep(workshop));
      })
    },
    getWorkshopListByCC() {
      if (this.getSelChargeCode) {
        let query = { chargCodeId: this.getSelChargeCode };
        this.$api.Workshop.find({ query })
          .then(({ data }) => {
            this.workshopListCC = _.cloneDeep(data);
            this.getIdeaCount()
          }).catch(() => this.toggleSpinner(false));
      } else {
        this.toggleSpinner(false);
      }
    },
    openWs(val) {
      this.toggleSpinner(true);
      this.bulkAdd = val.bulkAdd;
      const id = _.isObject(val) ? val._id : val
      this.$store.dispatch('idea/get', id)
        .then((idea) => {
          this.$nextTick(async () => {
            if (idea) {
              this.ideaData = _.cloneDeep(idea);
              this.workshopId = idea.workshop ? idea.workshop._id : "";
            }
  
            const callback = () => {
              this.showEditIdea = true;
              this.toggleSpinner(false);
            };

            if (_.isEmpty(this.workshopId)) {
              this.$q.notify({
                type: "negative",
                message: this.$t("itrack.ideaHasNoWS")
              })
              this.toggleSpinner(false);
              return
            }

            if (this.workshopId) {
              this.getWorkshopById(callback);
            } else {
              this.showEditIdea = true;
              this.toggleSpinner(false);
            }
          })
        })
    }
  }
}
</script>