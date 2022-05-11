import tensorflow as tf


class ESRGAN:

    def __init__(self, path):
        self.model = tf.saved_model.load(path)

    @staticmethod
    def __preprocess(image):
        if image.ndim == 3:
            image = tf.expand_dims(image, axis=0)
        image = tf.cast(image, tf.float32)
        return image

    @staticmethod
    def __postprocess(image):
        image = tf.squeeze(image, axis=0)
        image = tf.clip_by_value(image, 0, 255)
        image = tf.cast(image, tf.uint8)
        return image.numpy()

    def __inference(self, _image):
        image = pad_to_square(_image)
        image = self.__preprocess(image)

        output = self.model(image)
        output = output[0]
        output = inverse_pad_to_square(output, _image.shape)
        return self.__postprocess(output[None, :, :, :])

    def __call__(self, x):
        return self.__inference(x)


def pad_to_square(img):
    h, w, _ = img.shape
    max_size = max(h, w)
    size = 2
    while size < max_size:
        size *= 2
    img = tf.image.resize_with_pad(img, size, size)
    return img


def inverse_pad_to_square(img, shape):
    h, w, _ = shape
    max_size = max(h, w)
    img = tf.image.resize_with_pad(img, max_size, max_size, method='nearest')
    if max_size == h:
        pad = (max_size - w) // 2
        img = img[:, pad:pad + w, :]
    else:
        pad = (max_size - h) // 2
        img = img[pad:pad + h, :, :]
    return img
