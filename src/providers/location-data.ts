import { Injectable } from '@angular/core';

import { Http } from '@angular/http';

import { UserData } from './user-data';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class LocationData {
  depDistSql = "select * from (SELECT distinct cast(depto_id as integer) depto_id,  depto_nombre, cast(dist_id as integer) dist_id, dist_nombre FROM public.programacion) a order by a.depto_id, a.dist_id";
  deDistpUrl = 'http://geo.stp.gov.py/user/stp/api/v2/sql?q='+encodeURI(this.depDistSql);

  constructor(public http: Http) { }

  getDepDistritos() {
    return this.http.get(this.deDistpUrl);

  }
}
