#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# standard python imports

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()