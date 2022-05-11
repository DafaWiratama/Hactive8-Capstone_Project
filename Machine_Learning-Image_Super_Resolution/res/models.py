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

    def __inference(self, image):
        image = self.__preprocess(image)
        output = self.model(image)
        return self.__postprocess(output)

    def __call__(self, x):
        return self.__inference(x)