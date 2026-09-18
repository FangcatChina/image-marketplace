class AtlasConfig {
  public static readonly publicUrl = "https://images.091209.xyz";
  public static readonly registry = "https://raw.githubusercontent.com";
  public static readonly publicRegistry = "https://github.com";
  public static readonly title = "Vanilla OS Registry";

  public static readonly repos: ReadonlyArray<RepoInfo> = [
    { git: "vanilla-os/desktop-image", image: "ghcr.io/vanilla-os/gnome", verified: true, de: "GNOME", hardware: "Generic" },
    { git: "vanilla-os/nvidia-image", image: "ghcr.io/vanilla-os/gnome-nvidia", verified: true, de: "GNOME", hardware: "NVIDIA" },
    { git: "vanilla-os/nvidia-exp-image", image: "ghcr.io/vanilla-os/gnome-nvidia-modern", verified: true, de: "GNOME", hardware: "NVIDIA" },
    { git: "vanilla-os/vm-image", image: "ghcr.io/vanilla-os/gnome-vm", verified: true, de: "GNOME", hardware: "VM" },

    { git: "vanilla-flavors/china-image:dev", image: "ghcr.io/vanilla-flavors/gnome-china", verified: true, de: "GNOME", hardware: "Generic" },

    { git: "vanilla-kattleya/plasma-image", image: "ghcr.io/vanilla-kattleya/plasma:main", outdated: true, verified: false, de: "KDE Plasma", hardware: "Generic" },
    { pretty_name: "Kattleya Plasma Desktop Nvidia", pretty_id: "kattleya-nvidia", git: "vanilla-kattleya/nvidia-image:main", image: "ghcr.io/vanilla-kattleya/nvidia", outdated: true, verified: false, de: "KDE Plasma", hardware: "NVIDIA" },
    { pretty_name: "Kattleya Plasma Desktop VM", pretty_id: "kattleya-vm", git: "vanilla-kattleya/vm-image:main", image: "ghcr.io/vanilla-kattleya/vm", outdated: true, verified: false, de: "KDE Plasma", hardware: "VM" },

    { git: "kanola-images/kanola", image: "ghcr.io/kanola-images/plasma:main", outdated: true, verified: false, de: "KDE Plasma", hardware: "Generic" },
    { git: "kanola-images/kanola-nvidia", image: "ghcr.io/kanola-images/nplasma:main", outdated: true, verified: false, de: "KDE Plasma", hardware: "NVIDIA" },
    { git: "kanola-images/kanola-virt", image: "ghcr.io/kanola-images/vplasma:main", outdated: true, verified: false, de: "KDE Plasma", hardware: "VM" },

    { git: "kanola-images/hoisin:dev", image: "ghcr.io/kanola-images/hyprland:dev", outdated: true, verified: false, de: "Hyprland", hardware: "Generic" },
 
    { git: "planifolia-images/desktop-image", pretty_id: "planifolia-desktop", image: "ghcr.io/planifolia-images/desktop:main", outdated: true, verified: false, de: "GNOME", hardware: "Generic" },

    { pretty_name: "Vanilla Kipferl Desktop", git: "vanilla-kde/desktop-image:dev", image: "ghcr.io/vanilla-kde/kde:dev", verified: false, de: "KDE Plasma", hardware: "Generic" },
  ]

}

import type { RepoInfo } from '@/core/models';
import type { VibRecipe } from '@/core/models';
export default AtlasConfig;
