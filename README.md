# Husqvarna Mähroboter Messerwechsel Warnung

![preview](media/Screenshot.png)


 - #### Rot markierte Stelle ist die id von dem Datenpunkt vom Husqvarna Mähroboter wo die gefahrenen Meter für den Tag eingetragen sind.

- #### **[Optional]** <br> An die Grün markierte Stelle kommt dein Telegram User Name rein damit dir das Skript eine Telegramm Nachricht sendet wen die Messer gewechselt werden müssen.

- #### An der Blau markierte Stelle wird der Text für die Warnmeldung eingetragen diese wird auch im Iobroker Log ausgegeben.

- #### Die Gelb markierte Stelle kommt die id von dem Datenpunkt für die Fahrzeit für Heute rein.

Weiter unten wird nichts mehr verändert.

## Unter **0_userdata.0.husqvarna** werden 7 Datenpunkte erstellt.

1.  **changing_knife** ===> Zeigt an das die Messer gewechselt werden müssen.
2.  **drive_time** ===> zeigt die Zeit die der Mähroboter heute gefahren ist.
3.  **driving_route** ===>  zeigt die Fahrstrecke in km die der Mähroboter heute gefahren ist.
4.  **knife_changed** ===>  Mit diesem button resetet man die wechsel meldung und die km. 
5.  **rest_range** ===> zeigt die restlichen km bis zum wechsel.
6.  **telegram_changing_message** ===>  hier kann man die Telegramm nachricht ein und ausschalten **Standardmäßig ist sie ausgeschaltet.**
7.  **warning_limit** ===>  hier werden die km eingestelt bei den die warnung ausgegeben werden soll.



## Changelog
### 0.0.1 (2020-03-27)
* (Issi) Script Erstellt und hochgeladen 
