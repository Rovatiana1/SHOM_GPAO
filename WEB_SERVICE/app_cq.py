import sys
import os
import pickle
import random
import pandas as pd
from collections import Counter
from PyQt5.QtWidgets import (
    QGraphicsView, QGraphicsScene, QGraphicsPixmapItem, QGraphicsEllipseItem,
    QVBoxLayout, QHBoxLayout, QWidget, QPushButton, QLabel
)
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QFileDialog, QGraphicsView,
    QGraphicsScene, QGraphicsPixmapItem, QGraphicsEllipseItem,
    QVBoxLayout, QWidget, QPushButton, QMessageBox, QLabel, QScrollArea
)
from PyQt5.QtGui import QPixmap, QBrush, QPen, QColor
from PyQt5.QtCore import Qt


def calcul_sample(pop):
    """Retourne la taille de l'échantillon selon la population."""
    thresholds = [
        (2, 8, 2),
        (9, 15, 3),
        (16, 25, 5),
        (26, 50, 8),
        (51, 90, 13),
        (91, 150, 20),
        (151, 280, 32),
        (281, 500, 50),
        (501, 1200, 80),
        (1201, 3200, 125),
        (3201, 10000, 200),
        (10001, 35000, 315),
        (35001, 150000, 500),
        (150001, 500000, 800),
        (500001, float('inf'), 1250)  # pour pop >= 500001
    ]
    
    for low, high, sample in thresholds:
        if low <= pop <= high:
            return sample
    return pop  # si pop < 2, on retourne la population elle-même


def get_sampled_points(points, dates):
    sampled_points = []
    sampled_indices = []

    unique_dates = sorted(set(dates))
    
    # compter le nombre total de points par date
    total_counts = Counter(dates)

    for date in unique_dates:
        indices = [i for i, d in enumerate(dates) if d == date]
        n_sample = min(len(indices), calcul_sample(len(indices)))  # appliquer la règle
        
        chosen_indices = random.sample(indices, n_sample)
        
        sampled_indices.extend(chosen_indices)
        sampled_points.extend([points[i] for i in chosen_indices])
    
    # afficher le nombre de points sélectionnés et le total par date
    sampled_counts = Counter(dates[i] for i in sampled_indices)
    print("Nombre de points sélectionnés / total par date :")
    for date in unique_dates:
        selected = sampled_counts.get(date, 0)
        total = total_counts[date]
        print(f"Date: {date}, Sélectionnés: {selected}, Total: {total}")
    
    return sampled_points, sampled_indices

class ImageViewer(QWidget):
    def __init__(self, image_path, points, dates,metadata, parent=None):
        super().__init__(parent)

        # Stocker les points et dates
        self.points = points
        self.dates = dates
        self.zoom_factor = 1

        # Stocker les labels OK/KO
        self.labels = {}  # clé = index du point, valeur = "OK" ou "KO"
        self.metadata = metadata 
        # Préparer les couleurs par date
        unique_dates = sorted(set(dates))
        self.color_map = {}
        palette_choices = ['red', 'pink', 'green']
        for i, date in enumerate(unique_dates):
            color_type = palette_choices[i % len(palette_choices)]
            if color_type == 'red':
                self.color_map[date] = QColor(random.randint(150, 255), random.randint(0, 100), random.randint(0, 100))
            elif color_type == 'pink':
                self.color_map[date] = QColor(random.randint(200, 255), random.randint(150, 200), random.randint(150, 200))
            elif color_type == 'green':
                self.color_map[date] = QColor(random.randint(0, 100), random.randint(150, 255), random.randint(0, 100))

        # Points échantillonnés
        self.sampled_points, self.sampled_indices = get_sampled_points(points, dates)
        self.current_index = 0  # index du point actuellement affiché
        
        # Créer scène principale et pixmap
        self.scene = QGraphicsScene()
        self.view = QGraphicsView(self.scene)
        self.pixmap = QPixmap(image_path)
        self.image_item = QGraphicsPixmapItem(self.pixmap)
        self.scene.addItem(self.image_item)

        self.setFocusPolicy(Qt.StrongFocus)  # ImageViewer reçoit le focus clavier
        self.setFocus()
        self.view.setFocusPolicy(Qt.NoFocus)  # View ne bloque pas les touches

        # Boutons suivant/précédent
        self.next_button = QPushButton("Suivant")
        self.prev_button = QPushButton("Précédent")
        self.next_button.clicked.connect(self.next_point)
        self.prev_button.clicked.connect(self.prev_point)

        # Au départ, on désactive le bouton Suivant
        self.next_button.setEnabled(False)

        # Label pour afficher OK/KO
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setStyleSheet("font-size: 40px; font-weight: bold;")

        # Layout
        button_layout = QHBoxLayout()
        button_layout.addWidget(self.prev_button)
        button_layout.addWidget(self.next_button)
        main_layout = QVBoxLayout()
        main_layout.addWidget(self.view)
        main_layout.addWidget(self.status_label)
        main_layout.addLayout(button_layout)
        self.setLayout(main_layout)
        self.setFocusPolicy(Qt.StrongFocus)
        # Afficher le premier point
        self.display_point()

    def display_point(self):
        """Affiche le point courant avec zoom et entouré de 3 cm réels"""
        
        # Supprimer uniquement les anciens ellipses
        for item in self.scene.items():
            if isinstance(item, QGraphicsEllipseItem):
                self.scene.removeItem(item)

        # Afficher tous les points normaux (en petit)
        for (x, y), date in zip(self.points, self.dates):
            color = self.color_map.get(date, QColor(255, 0, 0))
            pen = QPen(color)
            pen.setWidth(1)
            small_diameter = 3
            ellipse = QGraphicsEllipseItem(x - small_diameter/2, y - small_diameter/2, small_diameter, small_diameter)
            ellipse.setPen(pen)
            ellipse.setBrush(QBrush(color))
            self.scene.addItem(ellipse)

        # Entourer le point sélectionné courant
        idx = self.sampled_indices[self.current_index]
        x, y = self.points[idx]

        # --- Calcul dynamique du diamètre en pixels ---
        meta = self.metadata  # dict contenant origin_px, x_max_px, x_max_value, etc.
        
        origin_px = tuple(map(int, meta['origin_px'].strip('()').split(',')))
        x_max_px = tuple(map(int, meta['x_max_px'].strip('()').split(',')))
        y_max_px = tuple(map(int, meta['y_max_px'].strip('()').split(',')))
        
        x_max_value = float(meta['x_max_value'])
        y_max_value = float(meta['y_max_value'])

        # pixels par mètre
        px_per_meter_x = abs(x_max_px[0] - origin_px[0]) / x_max_value
        px_per_meter_y = abs(y_max_px[1] - origin_px[1]) / y_max_value

        # 3 cm = 0.03 m
        diameter_m = 0.03
        diameter_px = (px_per_meter_x + px_per_meter_y) / 2 * diameter_m

        # Dessiner le cercle autour du point
        pen = QPen(QColor(255, 0, 0))
        pen.setWidth(1)
        ellipse = QGraphicsEllipseItem(x - diameter_px/2, y - diameter_px/2, diameter_px, diameter_px)
        ellipse.setPen(pen)
        ellipse.setBrush(QBrush(Qt.transparent))
        self.scene.addItem(ellipse)

        # Zoom sur ce point
        self.view.resetTransform()
        zoom_factor = 5
        self.view.scale(zoom_factor, zoom_factor)
        self.view.centerOn(x, y)

        # Mettre à jour le label si déjà labellisé
        if idx in self.labels:
            label = self.labels[idx]
            color = "green" if label == "OK" else "red"
            self.status_label.setText(label)
            self.status_label.setStyleSheet(f"font-size: 40px; font-weight: bold; color: {color};")
            self.next_button.setEnabled(True)
        else:
            self.status_label.setText("")
            self.next_button.setEnabled(False)


    def keyPressEvent(self, event):
        """Attribuer un label au point courant via touches N / W"""
        idx = self.sampled_indices[self.current_index]
        if event.key() == Qt.Key_N:
            self.labels[idx] = "OK"
            
            self.next_button.setEnabled(True)  # débloque Next
        elif event.key() == Qt.Key_W:
            self.labels[idx] = "KO"
            
            self.next_button.setEnabled(True)
        else:
            super().keyPressEvent(event)
            return

        # Mettre à jour le label
        label = self.labels[idx]
        color = "green" if label == "OK" else "red"
        self.status_label.setText(label)
        self.status_label.setStyleSheet(f"font-size: 40px; font-weight: bold; color: {color};")

        # Activer le bouton Suivant pour passer au point suivant
        self.next_button.setEnabled(True)

        # Vérifier si tous les points ont été labellisés
        if len(self.labels) == len(self.sampled_indices):
            QMessageBox.information(self, "Terminé", "Tous les points ont été labellisés !", QMessageBox.Ok)

    def next_point(self):
        if self.current_index < len(self.sampled_indices) - 1:
            self.current_index += 1
            self.display_point()
            self.next_button.setEnabled(False)  # bloque tant que pas labellisé
            self.setFocus(Qt.OtherFocusReason)# force le focus sur ImageViewer pour capter N/W

    def prev_point(self):
        
        if self.current_index > 0:
            self.current_index -= 1
            self.display_point()
            self.next_button.setEnabled(False)
            self.setFocus()
            self.setFocus(Qt.OtherFocusReason) 

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Visualisation des points par date")
        self.setGeometry(100, 100, 1400, 900)

        # Bouton pour importer un pickle
        self.open_button = QPushButton("Importer un fichier pickle")
        self.open_button.clicked.connect(self.open_pickle)

        # Layout principal
        layout = QVBoxLayout()
        layout.addWidget(self.open_button)
        self.container = QWidget()
        self.container.setLayout(layout)
        self.setCentralWidget(self.container)

    def open_pickle(self):
        options = QFileDialog.Options()
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Choisir un fichier pickle",
            "",
            "Pickle Files (*.pkl *.pickle)",
            options=options,
        )
        if file_path:
            try:
                # Charger le pickle
                with open(file_path, "rb") as f:
                    data = pickle.load(f)

                img_path = os.path.normpath(data["metadata"]["Img_path"])
                print(data['metadata'])
                points = data["points"]
                dates = data["dates"]

                if not os.path.exists(img_path):
                    QMessageBox.critical(self, "Erreur", f"Image introuvable :\n{img_path}")
                    return

                # Créer le viewer avec couleurs par date
                viewer = ImageViewer(img_path, points, dates, metadata=data['metadata'])

                # Ajouter la légende des couleurs
                legend_widget = QWidget()
                legend_layout = QVBoxLayout()
                legend_widget.setLayout(legend_layout)

                for date, color in viewer.color_map.items():
                    label = QLabel(f"🟢 {date}")
                    label.setStyleSheet(f"color: rgb({color.red()}, {color.green()}, {color.blue()}); font-weight: bold;")
                    legend_layout.addWidget(label)

                # Scroll pour légende si beaucoup de dates
                scroll_area = QScrollArea()
                scroll_area.setWidgetResizable(True)
                scroll_area.setWidget(legend_widget)
                scroll_area.setMaximumHeight(200) 
                # Nouveau layout
                layout = QVBoxLayout()
                layout.addWidget(self.open_button)
                layout.addWidget(viewer)
                layout.addWidget(QLabel("<b>Légende des couleurs :</b>"))
                layout.addWidget(scroll_area)

                self.container = QWidget()
                self.container.setLayout(layout)
                self.setCentralWidget(self.container)

            except Exception as e:
                QMessageBox.critical(self, "Erreur", f"Impossible de lire le pickle :\n{e}")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.showMaximized()
    sys.exit(app.exec_())
