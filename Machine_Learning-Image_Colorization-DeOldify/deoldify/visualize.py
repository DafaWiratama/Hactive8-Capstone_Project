from fastai.vision import *
from .filters import IFilter, MasterFilter, ColorizerFilter
from .generators import gen_inference_deep, gen_inference_wide
from PIL import Image


class ModelImageVisualizer:
    def __init__(self, filter: IFilter):
        self.filter = filter

    def _clean_mem(self):
        torch.cuda.empty_cache()

    def _open_pil_image(self, path: Path) -> Image:
        return PIL.Image.open(path).convert('RGB')

    def get_transformed_image(self, path: Path, render_factor: int = None, post_process: bool = True):
        self._clean_mem()
        orig_image = self._open_pil_image(path)
        filtered_image = self.filter.filter(orig_image, orig_image, render_factor=render_factor, post_process=post_process)
        return filtered_image

    def __call__(self, x, render_factor: int = None, post_process: bool = True):
        self._clean_mem()
        return self.filter.filter(x, x, render_factor=render_factor, post_process=post_process)


def get_image_colorizer(root_folder: Path = Path('./'), render_factor: int = 35, artistic: bool = True):
    if artistic:
        return get_artistic_image_colorizer(root_folder=root_folder, render_factor=render_factor)
    else:
        return get_stable_image_colorizer(root_folder=root_folder, render_factor=render_factor)


def get_stable_image_colorizer(root_folder: Path = Path('./'), weights_name: str = 'ColorizeStable_gen', render_factor: int = 35):
    learn = gen_inference_wide(root_folder=root_folder, weights_name=weights_name)
    filtr = MasterFilter([ColorizerFilter(learn=learn)], render_factor=render_factor)
    vis = ModelImageVisualizer(filtr)
    return vis


def get_artistic_image_colorizer(root_folder: Path = Path('./'), weights_name: str = 'ColorizeArtistic_gen', render_factor: int = 35):
    learn = gen_inference_deep(root_folder=root_folder, weights_name=weights_name)
    filtr = MasterFilter([ColorizerFilter(learn=learn)], render_factor=render_factor)
    vis = ModelImageVisualizer(filtr)
    return vis
