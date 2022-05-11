import tensorflow as tf


def load_image_from_bytes(bytes):
    img = tf.image.decode_image(bytes, expand_animations=False, channels=3)
    return img


def load_image_from_path(path):
    img = tf.io.read_file(path)
    return load_image_from_bytes(img)


def encode_png(img):
    return tf.image.encode_png(img, compression=4).numpy()


