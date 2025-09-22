import socket
import os
import re

def check_port_in_use(port: int) -> bool:
    """
    Vérifie si un port est déjà utilisé sur localhost.
    Retourne True si le port est occupé, False sinon.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", port))
        s.close()
        return False
    except socket.error:
        return True


def safe_mkdir(path: str):
    """
    Crée le dossier s'il n'existe pas déjà.
    """
    os.makedirs(path, exist_ok=True)


def parse_tuple_or_list(value_str: str):
    """
    Convertit une chaîne '(x, y)' ou '[x, y]' en tuple ou liste de floats.
    """
    match = re.match(r"([\[\(])\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*([\]\)])", value_str)
    if match:
        opener, num1_str, num2_str, closer = match.groups()
        num1, num2 = float(num1_str), float(num2_str)
        if opener == '(' and closer == ')':
            return (num1, num2)
        elif opener == '[' and closer == ']':
            return [num1, num2]
    raise ValueError(f"Impossible de parser la chaîne : {value_str}")


def round_to(value: float, decimals: int = 2) -> float:
    """
    Arrondit un nombre flottant à un nombre de décimales donné.
    """
    return round(value, decimals)


def flatten_list_of_lists(lists):
    """
    Transforme une liste de listes en une seule liste plate.
    """
    return [item for sublist in lists for item in sublist]


def pixel_to_logical(px, py, metadata):    
    origin_x, origin_y = (metadata["origin_px"])
    x_max_x, _ = (metadata["x_max_px"])
    _, y_max_y = (metadata["y_max_px"])

    
    origin_value = (metadata["origin_value"])
    origin_x_value = float((origin_value)[0])
    origin_y_value = float((origin_value)[1])
    


    x_end_value = float(metadata["x_max_value"]) 
    # y_max_value représente la VALEUR FINALE de l'axe Y (Ex: 3.0 pour 3 mètres)
    y_end_value = float(metadata["y_max_value"])

    
    logical_x_range_length = x_end_value - origin_x_value
    # La plage réelle de l'axe Y est (y_end_value - origin_y_value)
    logical_y_range_length = y_end_value - origin_y_value

    # Calculer les différences en pixels
    dx_pixels = x_max_x - origin_x
    # Pour Y, l'axe est inversé, donc la différence est origin_y - y_max_y
    dy_pixels = origin_y - y_max_y


    delta_x = logical_x_range_length / dx_pixels if dx_pixels != 0 else 0 
    delta_y = logical_y_range_length / dy_pixels if dy_pixels != 0 else 0 


    logical_x = (px - origin_x) * delta_x + origin_x_value
    logical_y = (origin_y - py) * delta_y + origin_y_value
    
    return round(logical_x, 2), round(logical_y, 2)


def clean_and_validate_metadata(raw_metadata):
    """
    Prend un dictionnaire de métadonnées brutes (avec des chaînes de tuples/listes/nombres)
    et les convertit en types Python appropriés (tuples, listes, nombres), puis les valide.
    """
    cleaned_metadata = {}

    for key, value_str in raw_metadata.items():
        # Si la valeur n'est pas une chaîne, on la garde telle quelle
        if not isinstance(value_str, str):
            cleaned_metadata[key] = value_str
            continue

        # Regex pour les formats (X, Y) ou [X, Y]
        # On capture les parenthèses ou crochets de début/fin pour déterminer le type final
        match_tuple_or_list = re.match(r"([\[\(])(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)([\]\)])", value_str)
        
        if match_tuple_or_list:
            opener = match_tuple_or_list.group(1) # '(' ou '['
            closer = match_tuple_or_list.group(4) # ')' ou ']'
            num1_str = match_tuple_or_list.group(2)
            num2_str = match_tuple_or_list.group(3)

            # Vérifier que les parenthèses/crochets sont bien appariés
            if (opener == '(' and closer == ')') or \
               (opener == '[' and closer == ']'):
                try:
                    num1 = float(num1_str)
                    num2 = float(num2_str)

                    # Si le format original était un tuple, on crée un tuple
                    if opener == '(':
                        value = (num1, num2)
                    # Si le format original était une liste, on crée une liste
                    else: # opener == '['
                        value = [num1, num2]

                except ValueError:
                    raise ValueError(f"Impossible de convertir les nombres dans le tuple/liste pour la clé '{key}': '{value_str}'")
            else:
                raise ValueError(f"Parenthèses/crochets mal appariés pour la clé '{key}': '{value_str}'")
        else:
            # Si ce n'est pas un format (X,Y) ou [X,Y], on essaie de convertir en nombre simple
            try:
                value = float(value_str)
                if value.is_integer(): # Si c'est un entier comme '24.0', on peut le garder en int
                    value = int(value)
            except ValueError:
                # Si ce n'est ni un tuple/liste, ni un nombre, on garde la string (ex: chemin de fichier)
                value = value_str
        
        cleaned_metadata[key] = value
    
    # --- Assertions pour valider la structure et les types après conversion ---
    # Ces assertions s'adapteront car 'origin_value' sera maintenant une liste si c'était '[X,Y]'
    required_keys = ['origin_px', 'origin_value', 'x_max_px', 'y_max_px', 'x_max_value', 'y_max_value', 'Img_path']
    for key in required_keys:
        assert key in cleaned_metadata, f"Clé '{key}' manquante dans les métadonnées après nettoyage."

    # Asserts sur les types spécifiques
    # Pour 'origin_px', 'x_max_px', 'y_max_px', on peut généralement s'attendre à des tuples
    assert isinstance(cleaned_metadata['origin_px'], tuple) and len(cleaned_metadata['origin_px']) == 2, \
        f"origin_px doit être un tuple de 2 éléments, type actuel: {type(cleaned_metadata['origin_px'])}, valeur: {cleaned_metadata['origin_px']}"
    assert isinstance(cleaned_metadata['x_max_px'], tuple) and len(cleaned_metadata['x_max_px']) == 2, \
        f"x_max_px doit être un tuple de 2 éléments, type actuel: {type(cleaned_metadata['x_max_px'])}, valeur: {cleaned_metadata['x_max_px']}"
    assert isinstance(cleaned_metadata['y_max_px'], tuple) and len(cleaned_metadata['y_max_px']) == 2, \
        f"y_max_px doit être un tuple de 2 éléments, type actuel: {type(cleaned_metadata['y_max_px'])}, valeur: {cleaned_metadata['y_max_px']}"
    
    # Pour 'origin_value', l'assertion doit accepter LISTE ou TUPLE
    assert isinstance(cleaned_metadata['origin_value'], (list, tuple)) and len(cleaned_metadata['origin_value']) == 2, \
        f"origin_value doit être un tuple ou une liste de 2 éléments, type actuel: {type(cleaned_metadata['origin_value'])}, valeur: {cleaned_metadata['origin_value']}"
    
    assert isinstance(cleaned_metadata['x_max_value'], (int, float)), \
        f"x_max_value doit être un nombre, type actuel: {type(cleaned_metadata['x_max_value'])}, valeur: {cleaned_metadata['x_max_value']}"
    assert isinstance(cleaned_metadata['y_max_value'], (int, float)), \
        f"y_max_value doit être un nombre, type actuel: {type(cleaned_metadata['y_max_value'])}, valeur: {cleaned_metadata['y_max_value']}"

    assert isinstance(cleaned_metadata['Img_path'], str), \
        f"Img_path doit être une chaîne de caractères, type actuel: {type(cleaned_metadata['Img_path'])}, valeur: {cleaned_metadata['Img_path']}"

    return cleaned_metadata
