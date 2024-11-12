
import Compress from 'client-compress'

const compressImg = async (files) => {
  const options = {
    //targetSize: 1,
    resize: false,
    quality: 0.5,    
    autoRotate: false
  }
  const compress = new Compress(options)

  return await compress.compress(files).then((conversions) => conversions)
}

const getCompresedFile = async (file) => {
  const form = new FormData()
  let images = await compressImg(file)
  await images.map(img => {
    const { photo, info } = img
    const file = new File([photo.data], photo.name)
    form.append('files', file, photo.name)
    return file
  })
  return form
}

export { compressImg, getCompresedFile }
