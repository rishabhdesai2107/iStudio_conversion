// composables/useIdeaBase64.js
import { ref, reactive, nextTick } from 'vue';
import async from 'async';
import _ from 'lodash';
import { useStore } from 'vuex';

export function useIdeaBase64() {
  const varName = ref(null);
  const callback = ref(null);
  const getFromToOnly = ref(false);

  const store = useStore(); // Use if you have a Vuex store available

  function getIdeaImages(dataProperty, cb, fromToOnly = false) {
    varName.value = dataProperty;
    callback.value = cb;
    getFromToOnly.value = fromToOnly;
    getCurrentPicture();
  }

  function getCurrentPicture() {
    const currentPicture = _.map(_.cloneDeep(this[varName.value]), "currentPicture");
    if (_.isEmpty(currentPicture)) {
      getAfterPicture();
    } else {
      async.forEachOf(currentPicture, (image, index, cb) => {
        execute(currentPicture, image, index, getAfterPicture, 'currentPicture', cb);
      });
    }
  }

  function getAfterPicture(dataProperty = null, cb = null) {
    if (dataProperty) varName.value = dataProperty;
    if (cb) callback.value = cb;

    const afterPicture = _.map(_.cloneDeep(this[varName.value]), "afterPicture");
    if (_.isEmpty(afterPicture)) {
      getFromToOnly.value ? callback.value() : getAudio();
    } else {
      async.forEachOf(afterPicture, (image, index, cb) => {
        const nextCallback = getFromToOnly.value ? callback.value : getAudio;
        execute(afterPicture, image, index, nextCallback, 'afterPicture', cb);
      });
    }
  }

  function getAudio(dataProperty = null, cb = null) {
    if (dataProperty) varName.value = dataProperty;
    if (cb) callback.value = cb;

    const audio = _.map(_.cloneDeep(this[varName.value]), "audio");
    if (_.isEmpty(audio)) {
      getVideo();
    } else {
      async.forEachOf(audio, (image, index, cb) => {
        execute(audio, image, index, getVideo, 'audio', cb);
      });
    }
  }

  function getVideo() {
    const video = _.map(_.cloneDeep(this[varName.value]), "video");
    if (_.isEmpty(video)) {
      getRefPicture();
    } else {
      async.forEachOf(video, (image, index, cb) => {
        execute(video, image, index, getRefPicture, 'video', cb);
      });
    }
  }

  function getRefPicture() {
    const refPicture = _.map(_.cloneDeep(this[varName.value]), "refPicture");
    if (_.isEmpty(refPicture)) {
      callback.value();
    } else {
      async.forEachOf(refPicture, (image, index, cb) => {
        execute(refPicture, image, index, callback.value, 'refPicture', cb);
      });
    }
  }

  async function execute(array, image, index, cb, assign, asyncCb = null) {
    const tempImg = _.cloneDeep(image);
    image = _.filter(
      _.map(image, (img) => {
        img = _.omit(img, 'signedUrl');
        img['path'] = decodeURIComponent(img.newNameWithPath);
        return img;
      }),
      (img) => img.path !== "placeholder.jpg"
    );

    if (image && image.length) {
      const res = await getImageFromS3(image);
      if (res && res.data && res.data.length) {
        image = _.merge(tempImg, res.data);
        if (this[varName.value][index] && this[varName.value][index][assign]) {
          this[varName.value][index][assign] = image;
        }
      }
      nextTick(() => {
        if (array.length - 1 === index) {
          store.commit(`idea/updateItems`, this[varName.value]);
          cb();
        }
      });
      if (asyncCb) asyncCb();
    } else {
      nextTick(() => {
        this[varName.value][index][assign] = _.merge(tempImg, [
          {
            path: "placeholder.jpg",
            orignalName: "placeholder.jpg",
            base64: this.$placeHolderBase64,
            newNameWithPath: "placeholder.jpg",
          },
        ]);
        store.commit(`idea/updateItems`, this[varName.value]);
        if (array.length - 1 === index) {
          cb();
        }
        if (asyncCb) asyncCb();
      });
    }
  }

  async function getImageFromS3(image) {
    const response = await fetch(`${process.env.API_BASE_URL}/get-signed-url-from-s3`, {
      method: "POST",
      mode: "cors",
      headers: {
        "content-type": "application/json",
        "x-tenant": localStorage.getItem("tenant"),
        "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
        authorization: `Bearer ${localStorage.getItem("authorization")}`,
      },
      body: JSON.stringify({ data: { image } }),
    });
    return response.json();
  }

  return {
    getIdeaImages,
    getCurrentPicture,
    getAfterPicture,
    getAudio,
    getVideo,
    getRefPicture,
    execute,
    getImageFromS3,
  };
}
