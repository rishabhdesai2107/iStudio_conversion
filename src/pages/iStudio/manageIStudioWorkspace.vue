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
      :columns-filter="true"
      :draggable="true"
      :header-filter="false"
      file-name="workshopList"
      :ppt-download="true"
      :excel-download="true"
      :selection="'multiple'"
      :role="user.role"
      :column-state="stateSavedColumn"
      :module="module"
      :loader="loader"
      :show-refetch="true"
      @row-edit="openWs"
      @visible-columns="setTableState"
      @row-delete="deleteIdea"
      @update-tag="autoSaveTag"
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
            :bulk-add="bulkAdd"
            :idea="getIdeaForEdit"
            @idea-saved="showEditIdea = false"
            @idea-patched-event="ideaUpdatedEvent"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref,computed,reactive,defineAsyncComponent,watch } from 'vue';
import { useStore } from 'vuex';
import { useIdeaBase64 } from '../../composables/idea-base64.js'; // Assuming a composable is created for the mixin functionality
import { setTableState, getTableState } from '../../utils/StateSaveHelper';

const props = defineProps({
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
});

const store = useStore();
const { base64Encode, base64Decode } = useIdeaBase64(); // Using the composable
// For ideaBase64, you’ll need to create a composable, useIdeaBase64, which will provide the functions previously in the mixin.
// Computed properties and store mappings can be added here as needed
const totalPageCount = ref(0);
const totalNumberOfIdea = ref(0);
const ideaData = reactive({});
const workshopListCC = ref([]);
const bulkAdd = ref(false);
const showEditIdea = ref(false);
const objWorkeshop = reactive({});
const columns = ref([]);
const ideaRowData = ref([]);
const listOfWkIds = ref([]);
const stateSavedColumn = ref([]);
const events = ref([]);
const lastPage = ref(0);
const ideaCount = ref(0);
const ideas = ref([]);
const loader = ref(false);
const limit = ref(500);
const skip = ref(0);
const userFilterQuery = reactive({});
const listOfIdeas = ref([]);

// Dynamic component imports
const IStudioIcf = defineAsyncComponent(() => import('./iStudiolcf.vue'));
const IStudioGrid = defineAsyncComponent(() => import('./iStudioGrid2table.vue'));

const roles = computed(() => store.getters['roles']);
const user = computed(() => store.getters['VTL/user']);
const getSelChargeCode = computed(() => store.getters['VTL/getSelChargeCode']);
const getCurrentChargeCode = computed(() => store.getters['VTL/getCurrentChargeCode']);
const ideaFindPending = computed(() => store.state.idea.isFindPending);
const findIdeaInStore = computed(() => store.getters['idea/find']);
const ideaRemoved = computed(() => store.getters['idea/removed']);

const ideaList = computed(() => listOfIdeas);
const filterQuery = computed(() => userFilterQuery);
const ideaParams = computed(() => ({
  query: {
    $limit: limit.value,
    $skip: skip.value,
    ...findIdeaQuery,
    ...userFilterQuery
  },
  paginate: false
}));

const getIdeaForEdit = computed(() => ideaData);

const findIdeaQuery = computed(() => {
  const query = {
    'chargeCode._id': getSelChargeCode.value
  };

  if (
    !getCurrentChargeCode.value.showAllIdea &&
    !roles.value.includes('Admin') &&
    !roles.value.includes('Super Admin')
  ) {
    query['createdBy'] = user.value?._id;
  }

  if (!roles.value.includes('Super Admin')) {
    query['$or'] = [
      { 'workshop._id': { $in: workshopListCC.value.map(item => item._id) } },
      { createdBy: user.value?._id }
    ];
  }

  // NOTE Need to all idea irrespective of who created it
  if (getIlake.hasOwnProperty('_id')) {
    if (getIlake && getIlake.level._id === 2) {
      query['aggregateId._id'] = getIlake._id;
    } else {
      query['productId._id'] = getIlake._id; // get product_id from prop can be default
    }
  }

  return query;
});

const tableColumns = computed(() => [
  {
    name: "index",
    align: "center",
    label: $t("common.seqNo"),
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
    label: $t("itrack.ideaNumber"),
    field: "ideaNum",
    search: (val, clear) => constructSearch(val, clear, 'ideaNum'),
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "workshop",
    label: $t("common.workshopCode"),
    align: "left",
    field: "workshop",
    search: (val, clear) => constructSearch(val, clear, 'workshop.name'),
    format: (val) => `${val}`,
  },
  {
    name: "productId",
    align: "center",
    label: $t("common.model"),
    field: "productId",
    search: (val, clear) => constructSearch(val, clear, 'productId.name'),
    format: (val) => `${val}`,
  },
  {
    name: "aggregateId",
    align: "center",
    label: $t("common.aggregate"),
    field: "aggregateId",
    search: (val, clear) => constructSearch(val, clear, 'aggregateId.name'),
    format: (val) => `${val}`,
  },
  {
    name: "subAggregateId",
    align: "center",
    label: $t("common.subAggregate"),
    field: "subAggregateId",
    search: (val, clear) => constructSearch(val, clear, 'subAggregateId.name'),
    format: (val) => `${val}`,
  },
  {
    name: "partName",
    align: "center",
    label: $t("common.part"),
    field: "partName",
    search: (val, clear) => constructSearch(val, clear, 'partName.name'),
    format: (val) => `${val}`,
  },
  {
    name: "title",
    align: "center",
    label: $t("itrack.ideaTitle"),
    field: "title",
    search: (val, clear) => constructSearch(val, clear, 'title'),
    format: (val) => `${val}`,
    classes: "ellipsis",
  },
  {
    name: "description",
    align: "center",
    label: $t("itrack.ideaDesc"),
    search: (val, clear) => constructSearch(val, clear, 'description'),
    field: "description",
    format: (val) => `${val}`
  },
  {
    name: "createdByUser",
    label: $t("common.createdBy"),
    field: "createdByUser",
    sortable: true,
  },
  {
    sortable: true,
    name: "updatedBy",
    label: $t("common.updatedBy"),
    field: "updatedBy"
  },
  {
    name: "currentPicture",
    align: "center",
    label: $t("iworkshop.fromImg"),
    field: "currentPicture",
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "afterPicture",
    align: "center",
    label: $t("iworkshop.toImg"),
    field: "afterPicture",
    format: (val) => `${val}`,
    sortable: true,
  },
]);

const loadIdeaData = () => {
  let tblColData = _.cloneDeep(tableColumns);

if (!roles.value.some((el) => _.includes(["Admin", "Super Admin"], el))) {
  tblColData = _.filter(tblColData, (x) => x.name !== "tag");
}

    // get all workshop and create columns from unique keys
    let varColArr = [];
    let rowDataIdeas = _.map(
      _.filter(_.cloneDeep(ideaList), (idea) => idea),
      (idea, index) => {
        idea['index'] = (index + 1);
        return idea;
      }
    );

    let priVar;
    let secVar;

    if (rowDataIdeas.length) {
      if (workshopListCC.value.length) {
        const icfVariables = workshopListCC.value.map((x) => x.icfConfig);
        priVar = _.uniqBy(
          icfVariables
            .flatMap((x) => x.primVariable.map((v) => ({
              name: v.name,
              unit: `${_.isObject(v.unit) ? v.unit.name : v.unit || ""}`,
            }))),
          "name"
        );

        secVar = _.uniqBy(
          icfVariables
            .flatMap((x) => x.secVariable.map((v) => ({
              name: v.name,
              unit: `${_.isObject(v.unit) ? v.unit.name : v.unit || ""}`,
            }))),
          "name"
        );
        varColArr = [...priVar, ...secVar];
      } else {
        priVar = rowDataIdeas[0].primVariable;
        secVar = rowDataIdeas[0].secVariable;
        varColArr = [...priVar, ...secVar];
      }
    }

    varColArr.forEach((v) => {
      let colObj = {
        name: v.name,
        align: "center",
        label: v.unit
          ? `${v.name}[${v.unit.name || v.unit}]`
          : v.name,
        field: v?.name?.toLowerCase()?.replace(/ /g, "_"),
        format: (val) => `${val}`,
        search: (val, clear) => {
          let filter = {};

          nextTick(() => {
            const queryObj = _.isArray(val) ? { $in: _.map(val, (v) => new RegExp(`\^${v}`, 'i')) } : { $regex: val, $options: 'i' };

            if (_.find(priVar, { name: v.name })) {
              filter = { $or: [{ 'primVariable.name': queryObj }, { 'primVariable.unit': queryObj }, { 'primVariable.value': queryObj }] };
            }

            if (_.find(secVar, { name: v.name })) {
              filter = { $or: [{ 'secVariable.name': queryObj }, { 'secVariable.unit': queryObj }, { 'secVariable.value': queryObj }] };
            }

            if (clear) {
              userFilterQuery.value = Object.assign({}, _.omit(userFilterQuery.value, ['$or']));
            } else {
              const query = _.isArray(val) ? { $in: val } : val;
              userFilterQuery.value = Object.assign({}, userFilterQuery.value, filter);
            }
          });
        }
      };
      tblColData.push(colObj);
    });

    rowDataIdeas.forEach((x) => {
      let array = [];

      if (x) {
        if (x.primVariable) {
          array.push(...x.primVariable);
        }
        if (x.secVariable) {
          array.push(...x.secVariable);
        }
        array.forEach((v) => {
          const key = v?.name?.toLowerCase()?.replace(/ /g, "_");
          if (_.isArray(v.value)) {
            x[key] = v.value.length ? (_.every(v.value, _.isObject) ? _.map(v.value, "name").toString() : v.value.toString()) : "-";
          } else if (_.isObject(v.value)) {
            x[key] = v.value ? v.value.name : "-";
          } else {
            x[key] = v.value;
          }
        });
      }
    });

    columns.value = _.uniqBy(tblColData, "name");
    let colKeys = _.map(columns.value, (x) => x.field);
    const placeholderImage = {
      path: "placeholder.jpg",
      originalName: "placeholder.jpg",
      base64: this.$placeHolderBase64,
      newNameWithPath: "placeholder.jpg",
    };

    rowDataIdeas.forEach((x, index) => {
      if (x) {
        delete x.secVariable;
        delete x.primVariable;

        let rowObj = {};

        colKeys.forEach((c) => {
          if (c === "index") {
            rowObj[c] = index + 1;
          } else if (c === "tag") {
            rowObj[c] = x.tag;
          } else if (["currentPicture", "afterPicture"].includes(c)) {
            let img = x[c][0];
            rowObj[c] = img?.signedUrl ? img : placeholderImage;
          } else {
            rowObj[c] = _.isObject(x[c]) ? (x[c]?.name || "-") : (x[c] || "-");
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

    ideaRowData.value = rowTblRowData;
    Object.freeze(ideaRowData.value);

    return _.map(_.orderBy(rowTblRowData, '_id'), (idea, index) => {
      idea["index"] = index + 1;
      return idea;
    });
  };

  watch(
    () => getSelChargeCode,
    () => {
      ideaCount.value = 0;
      listOfIdeas.value = [];
      userFilterQuery.value = {};
      toggleSpinner(true);
      totalPageCount.value = 0;
      getWorkshopListByCC();
    }
  );

  watch(
  () => ideaRemoved.value, // Use `.value` if `ideaRemoved` is a ref or computed
  (newValue) => {
    if (newValue.updatedBy !== user.value._id) { // Use `.value` for `user._id`
      removedIdeaEvent(newValue);
    }
  },
  { deep: true }
);


  onMounted(() => {
  toggleSpinner(true);
  const { items } = getTableState("workshop-manage-idea");

  if (items && items["workshop-manage-idea"]) {
    stateSavedColumn.value = items["workshop-manage-idea"];
  }

  loader.value = true;
  getWorkshopListByCC();
});


const ideaUpdatedEvent = (idea) => {
  console.log({ idea });

  if (!_.isEmpty(idea)) {
    const index = _.findIndex(listOfIdeas.value, { _id: idea._id });
    const tableDataIndex = _.findIndex(loadIdeaData.value, { _id: idea._id });

    if (index > -1) {
      listOfIdeas.value[index] = {
        ..._.merge(listOfIdeas.value[index], _.omit(idea, ['createdByUser'])),
        updatedByData: idea?.updated,
        updatedBy: idea?.updated?.email,
        createdByUser: idea?.created?.email,
      };
    }
    if (tableDataIndex > -1) {
      loadIdeaData.value[tableDataIndex] = {
        ...loadIdeaData.value[tableDataIndex],
        updatedBy: idea?.updated?.email,
        createdByUser: idea?.created?.email,
      };
    }
  }
};

const getFileType = (filename) => {
  if (filename) {
    const ext = _.toLower(filename.split('.')?.pop());
    const imageType = ['png', 'gif', 'jpeg', 'webp', 'jpg', 'jfif'];
    const videoType = ['webm', 'mp4', 'avi', 'webm', 'ogg'];
    const audioType = [
      'mpeg', 'vorbis', 'midi', 'x-midi',
      'mpeg', 'webm', 'wav', 'x-aac',
      'mp4', 'mp3', 'webm', 'ogg',
    ];

    if (_.includes(imageType, ext)) return `image/${ext}`;
    if (_.includes(audioType, ext)) return `audio/${ext}`;
    if (_.includes(videoType, ext)) return `video/${ext}`;

    return `application/${ext}`;
  }

  return `application/jpg`;
};

const refresh = () => {
  toggleSpinner(true);
  getIdeaCount();
};

const virtualScroll = (data) => {
  const { index, direction } = data;

  if (
    index &&
    !ideaFindPending.value &&
    direction === 'increase' &&
    index + 1 === ideaList.value.length &&
    index !== totalNumberOfIdea.value - 1 &&
    index + 1 < totalNumberOfIdea.value - 1
  ) {
    loader.value = true;
    skip.value = index + 1;
    const { query } = ideaParams.value;
    findIdea(query);
  }
};

const findIdea = (query) => {
  if (ideaList.value.length === totalNumberOfIdea.value) {
    toggleSpinner(false);
    setTimeout(() => {
      loader.value = false;
    }, 700);
    return;
  }

  store.dispatch('idea/find', { query })
    .then(({ total, data }) => {
      listOfIdeas.value = _.unionBy([..._.cloneDeep(ideaList.value), ...data], '_id');
      totalNumberOfIdea.value = total;
      toggleSpinner(false);
      setTimeout(() => {
        loader.value = false;
      }, 500);
    });
};

const constructSearch = (val, clear, field) => {
  if (clear) {
    userFilterQuery.value = Object.assign({}, _.omit(userFilterQuery.value, [field]));
  } else {
    const query = _.isArray(val) ? { $in: _.map(val, (v) => new RegExp(`^${v}`, 'i')) } : { $regex: val, $options: 'i' };
    userFilterQuery.value = Object.assign({}, userFilterQuery.value, { [field]: query });
  }

  nextTick(() => {
    getIdeaCount(); // NOTE Get count based on the applied filter
  });
};

const addRemoveFilters = ({ field, value, clear, options }) => {
  const column = (
    _.find(_.cloneDeep(columns.value), { field }) ||
    _.find(_.cloneDeep(columns.value), { field: field && field.toLowerCase().replace(/ /g, "_") })
  );

  if (options) {
    value = _.map(_.filter(options, (row) => _.includes(value, row.value)), 'label');
  }

  if (column && 'search' in column) {
    if (clear || _.isEmpty(value)) {
      column.search(value, true);
    } else {
      column.search(value);
    }
  }
};

const getIdeaCount = () => {
  const { query } = ideaParams.value;
  store.dispatch('idea/find', { query: { ..._.omit(query, ['$skip', '$limit']), $limit: 0 } })
    .then(({ total }) => {
      if (total === 0) {
        loader.value = false;
        toggleSpinner(false);
      }

      totalNumberOfIdea.value = total;
      const { query } = ideaParams.value;
      findIdea(query);
    });
};

const removedIdeaEvent = (idea) => {
  if (idea && api.Idea.getFromStore(idea._id)) {
    store.commit('idea/removeItem', idea);
  }
};

const autoSaveTag = (data) => {
  const { _id, tag } = data;

  if (tag === "delete") {
    confirmBox({
      message: t("iworkshop.deleteIdea"),
    }).onOk(() => {
      if (checkIsSuperAdminHasAccess(user.value.role)) {
        toggleSpinner(true);
        store.dispatch('idea/remove', _id)
          .then(() => {
            toggleSpinner(false);
          }).catch(() => {
            toggleSpinner(false);
          });
      } else {
        toggleSpinner(false);
      }
    }).onCancel(() => {
      store.dispatch('idea/get', _id)
        .then(() => {
          const index = _.findIndex(ideaRowData.value, ["_id", _id]);
          ideaRowData.value[index]["tag"] = idea["tag"];
        });
    });
  } else {
    if (checkIsSuperAdminHasAccess(user.value.role)) {
      store.dispatch("idea/patch", [_id, { tag }]);
    }
  }
};

  setTableState = (val) => {
  setTableState(val, "workshop-manage-idea");
};

const deleteIdea = (_id) => {
  confirmBox({
    message: t("iworkshop.deleteIdea"),
  }).onOk(() => {
    if (checkIsSuperAdminHasAccess(user.value.role)) {
      toggleSpinner(true);
      store.dispatch('idea/remove', _id)
        .then(() => {
          totalNumberOfIdea.value--;
          store.commit('idea/removeItem', _id);
          listOfIdeas.value = _.reject(_.cloneDeep(ideaList.value), { _id });
        }).then(() => {
          toggleSpinner(false);
        }).catch(() => {
          toggleSpinner(false);
        });
    }
  });
};

const getWorkshopById = (callBack = () => {}) => {
  api.Workshop.get(workshopId.value).then((workshop) => {
    objWorkshop.value = _.cloneDeep(workshop);
    showEditIdea.value = true;
    callBack(_.cloneDeep(workshop));
  });
};

const getWorkshopListByCC = () => {
  if (getSelChargeCode.value) {
    let query = { chargCodeId: getSelChargeCode.value };
    api.Workshop.find({ query })
      .then(({ data }) => {
        workshopListCC.value = _.cloneDeep(data);
        getIdeaCount();
      }).catch(() => toggleSpinner(false));
  } else {
    toggleSpinner(false);
  }
};

const openWs = (val) => {
  toggleSpinner(true);
  bulkAdd.value = val.bulkAdd;
  const id = _.isObject(val) ? val._id : val;
  store.dispatch('idea/get', id)
    .then((idea) => {
      nextTick(async () => {
        if (idea) {
          ideaData.value = _.cloneDeep(idea);
          workshopId.value = idea.workshop ? idea.workshop._id : "";
        }

        const callback = () => {
          showEditIdea.value = true;
          toggleSpinner(false);
        };

        if (_.isEmpty(workshopId.value)) {
          q.notify({
            type: "negative",
            message: t("itrack.ideaHasNoWS")
          });
          toggleSpinner(false);
          return;
        }

        if (workshopId.value) {
          getWorkshopById(callback);
        } else {
          showEditIdea.value = true;
          toggleSpinner(false);
        }
      });
    });
};

</script>
