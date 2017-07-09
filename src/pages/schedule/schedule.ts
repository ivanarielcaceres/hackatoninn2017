import { Component, ViewChild } from '@angular/core';
import { AlertController, App, FabContainer, ItemSliding, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';
import { Chart } from 'chart.js';

import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { LocationData } from '../../providers/location-data';

import { SessionDetailPage } from '../session-detail/session-detail';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';


@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', { read: List }) scheduleList: List;
  @ViewChild('stackedCanvas') stackedCanvas;

  stackedChart: any;
  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any = [];
  groups: any = [];
  confDate: string;
  deptos: any = [];
  distrs: any = [];
  list: any = []

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public confData: ConferenceData,
    public locationData: LocationData,
    public user: UserData,
  ) {}

  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
  }

  ionViewDidLoad() {
    let grafico = []
    let rowsPlanificado = []
    let rowsEjecutado = []
    this.locationData.getPlanificado().subscribe((planificados) => {
        rowsPlanificado = planificados.json().rows
        this.locationData.getEjecutado().subscribe((ejecutados) => {
          rowsEjecutado = ejecutados.json().rows

          var rows = rowsPlanificado
          for(var i in rows){
            var row = rows[i]
            var obj = {}
            obj['label'] = row.depto_nombre;
            obj['backgroundColor'] = this.random_rgba();
            obj['stack'] = 'Stack 0';
            obj['data'] = []
            obj['data'].push(row.planificado);
            this.list.push(obj);
          }

          rows = rowsEjecutado
          var ind = 0
          for(var i in rows){
            var row = rows[i]
            this.list[ind]['data'].push(row.ejecutado)
            ind++
          }

          let barChartData = {
              labels: ["Programado", "Ejecutado"],
              datasets: this.list

          };
          this.stackedChart = new Chart(this.stackedCanvas.nativeElement, {

                  type: 'bar',
                  data: barChartData,
                  options: {
                      title:{
                          display:true,
                          text:"Programado vs Ejecutado"
                      },
                      tooltips: {
                          mode: 'index',
                          intersect: false
                      },
                      responsive: true,
                      scales: {
                          xAxes: [{
                              stacked: true,
                          }],
                          yAxes: [{
                              stacked: true
                          }]
                      }
                  }

              });
        })
    })

    // let barChartData = {
    //     labels: ["Programado", "Ejecutado"],
    //     datasets: [{
    //         label: 'Alto Paraná',
    //         backgroundColor: 'rgba(119, 0, 59, 0.4)',
    //         stack: 'Stack 0',
    //         data: [
    //             12300, 13400
    //         ]
    //     }, {
    //         label: 'Central',
    //         backgroundColor: 'rgba(27, 17, 59, 0.5)',
    //         stack: 'Stack 0',
    //         data: [
    //             15200, 13000
    //         ]
    //     },
    //     {
    //         label: 'Canindeyu',
    //         backgroundColor: 'rgba(118, 17, 59, 0.5)',
    //         stack: 'Stack 0',
    //         data: [
    //             18900, 10000
    //         ]
    //     },
    //     {
    //         label: 'Amambay',
    //         backgroundColor: 'rgba(118, 17, 204, 0.5)',
    //         stack: 'Stack 0',
    //         data: [
    //             80000, 12500
    //         ]
    //     },
    //     {
    //         label: 'San Pedro',
    //         backgroundColor: 'rgba(118, 196, 204, 0.5)',
    //         stack: 'Stack 0',
    //         data: [
    //             80000, 125000
    //         ]
    //     }]
    //
    // };

  }

  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
    });
  }

  presentFilter() {
    let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    modal.present();

    modal.onWillDismiss((data: any[]) => {
      if (data) {
        this.excludeTracks = data;
        this.updateSchedule();
      }
    });

  }

  goToSessionDetail(sessionData: any) {
    // go to the session detail page
    // and pass in the session data

    this.navCtrl.push(SessionDetailPage, { sessionId: sessionData.id, name: sessionData.name });
  }

  addFavorite(slidingItem: ItemSliding, sessionData: any) {

    if (this.user.hasFavorite(sessionData.name)) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.name);

      // create an alert instance
      let alert = this.alertCtrl.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      alert.present();
    }

  }

  removeFavorite(slidingItem: ItemSliding, sessionData: any, title: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Remove',
          handler: () => {
            // they want to remove this session from their favorites
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();

            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });
    // now present the alert on top of all other content
    alert.present();
  }

  openSocial(network: string, fab: FabContainer) {
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }

  doRefresh(refresher: Refresher) {
    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;

      // simulate a network request that would take longer
      // than just pulling from out local json file
      setTimeout(() => {
        refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Sessions have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }
}
