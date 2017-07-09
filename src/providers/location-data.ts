import { Injectable } from '@angular/core';

import { Http } from '@angular/http';

import { UserData } from './user-data';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class LocationData {
  depDistSql = "select * from (SELECT distinct cast(depto_id as integer) depto_id,  depto_nombre, cast(dist_id as integer) dist_id, dist_nombre FROM public.programacion) a order by a.depto_id, a.dist_id";
  depDistUrl = 'http://geo.stp.gov.py/user/stp/api/v2/sql?q='+encodeURI(this.depDistSql);

  planificadoSql = "SELECT depto_nombre, sum(cast(cant_prog as decimal)) planificado FROM programacion group by depto_nombre order by depto_nombre limit 6 offset 1";
  planificadoUrl = 'http://geo.stp.gov.py/user/stp/api/v2/sql?q='+encodeURI(this.planificadoSql);

  ejecutadoSql = "SELECT depto_nombre, sum(cast(avance_cant as decimal)) ejecutado FROM avance group by depto_nombre order by depto_nombre limit 6 offset 1";
  ejecutadoUrl = 'http://geo.stp.gov.py/user/stp/api/v2/sql?q='+encodeURI(this.ejecutadoSql);

  constructor(public http: Http) { }

  getPlanificado() {
    return this.http.get(this.planificadoUrl)
  }

  getEjecutado() {
    return this.http.get(this.ejecutadoUrl);

  }
}
