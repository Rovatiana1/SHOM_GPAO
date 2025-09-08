# Étape 1 : Créer une nouvelle branche
git checkout --orphan temp_branch
git add -A
git commit -m "Fresh start"

# Étape 2 : Supprimer l'ancienne branche main
git branch -D main
git branch -m main

# Étape 3 : Repousser avec force
git push --force origin_v main