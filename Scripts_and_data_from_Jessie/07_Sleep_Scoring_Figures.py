# -*- coding: utf-8 -*-
"""
Code for Sleep Scoring Figures

Created on Wed Feb  3 15:51:09 2021

@author: Jessie Kendall-Bar
"""
#%%
import yasa
import mne
import os
import scipy
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.colors as colors
import entropy as ent
import seaborn as sns
from matplotlib import mlab as mlab
import matplotlib.gridspec as gs

#%%
# Change working directory to sleep data folder
os.chdir("G:\My Drive\Dissertation Sleep\Sleep_Analysis\Data")
print("Current Working Directory ", os.getcwd())

# Load the EDF file, excluding the EOGs and EKG channels
raw = mne.io.read_raw_edf("test12_Wednesday_05_Excerpt_for_Staging_Figure.edf", preload=True, exclude=['MagZ'])
# raw.resample(100)                      # Downsample the data to 100 Hz
# raw.filter(0.1, 40)                    # Apply a bandpass filter from 0.1 to 40 Hz
# raw.pick_channels(['C4-A1', 'C3-A2'])  # Select a subset of EEG channels
raw # Outputs summary data about file

# Inspect Data
print(raw.info)
print('The channels are:', raw.ch_names)
print('The sampling frequency is:', raw.info['sfreq'])

# Trying and failing to rename channels
# new_names = ['ECG', 'LEOG', 'REOG', 'LEMG', 'REMG', 'LEEG1', 'REEG2', 'LEEG3', 'REEG4', 'AccelX', 'AccelY', 'AccelZ', 'Illum_lux', 'Pressure_bars', 'Temp_C', 'HR']
channel_renaming_dict = {name: name.replace(' ', '_') for name in raw.ch_names}
raw.rename_channels(channel_renaming_dict)
print('The channels are:', raw.ch_names)

# Output like: The channels are: ['ECG', 'L_EOG', 'R_EOG', 'L_EMG', 'R_EMG', 
                                #'L_EEG_1', 'R_EEG_2', 'L_EEG_3', 'R_EEG_4', 
                                #'Accel_X', 'Accel_Y', 'Accel_Z', 'Illum_(lux)', 
                                #'Pressure_(bars)', 'Temp_(C)', 'Heart_Rate']
# Assigning Channel types:
raw.set_channel_types({'ECG':'ecog',
                       'L_EOG':'eog','R_EOG':'eog',
                       'L_EMG':'emg','R_EMG':'emg',
                       'L_EEG_1':'eeg', 'R_EEG_2':'eeg',
                       'L_EEG_3':'eeg', 'R_EEG_4':'eeg',
                       'Accel_X': 'resp','Accel_Y':'resp','Accel_Z':'resp', 'Illum_(lux)':'syst',
                       'Pressure_(bars)':'misc','Temp_(C)':'syst','Heart_Rate':'bio'})
print(raw.copy().pick_types(eeg=True, eog=True, ecog=True, bio=True, resp=True, misc=True).ch_names)

# Generating channel indices to subset data with
subset_index1 = mne.pick_channels(raw.ch_names, include=[], exclude=['Accel_X','Accel_Z','Illum_(lux)','Pressure_(bars)', 'Temp_(C)'])
subset_index2 = mne.pick_types(raw.info, eeg=True, eog=True, emg=True, ecg=True)

#Cropping data
raw_selection = raw.copy().crop(tmin=100, tmax=150)
print(raw_selection)

#Preliminary 10s plot of raw data
mne.viz.plot_raw(raw_selection)
mne.viz.plot_raw(raw)

# Plotting the first 50 seconds of the first channel's electrophysiological data
Fs = raw.info['sfreq']  # the sampling frequency or 500
start_stop_seconds = np.array([0, 5000])
start_sample, stop_sample = (start_stop_seconds * Fs).astype(int)
channel_index = 0
ECG_selection = raw[channel_index, start_sample:stop_sample]
LEEG3_selection = raw[7, start_sample:stop_sample] #LEEG3 is stored in column 7
REEG4_selection = raw[8, start_sample:stop_sample] #REEG4 is stored in column 8
# Time data in sec is stored in column 0 and data is stored in column 1 (2nd)
plt.plot(ECG_selection[1], ECG_selection[0].T)
plt.plot(LEEG3_selection[1], LEEG3_selection[0].T) #plots on top of previous plot with same y axis

# Plotting data with channel names
channel_names = ['L_EEG_3', 'R_EEG_4']
two_eeg_chans = raw[channel_names, start_sample:stop_sample]
y_offset = np.array([1e-4, 0])  # just enough to separate the channel traces
x = two_eeg_chans[1]
y = two_eeg_chans[0].T + y_offset
lines = plt.plot(x, y)
plt.legend(lines, channel_names)

#%%
# Plotting spectrogram for first 50 seconds of first channel 
NFFT = 1024       # the length of the windowing segments
spectrum1, freqs1, bins = mlab.specgram(LEEG3_selection[0][0], NFFT=NFFT, Fs=Fs, noverlap=900)
spectrum2, freqs2, bins = mlab.specgram(REEG4_selection[0][0], NFFT=NFFT, Fs=Fs, noverlap=900)

# Only run for [0,5000]
min_val = 5 * np.log10(min(spectrum1.min(), spectrum2.min()))
max_val = 15.5 * np.log10(min(spectrum1.max(), spectrum2.max()))

start_stop_seconds = np.array([0,5000])
start_sample, stop_sample = (start_stop_seconds * Fs).astype(int)

cmap = plt.get_cmap('magma')
cmap.set_under(color='k', alpha=None)

sns.set_style(style='white')

gs0 = gs.GridSpec(6,2, width_ratios=[10,0.1])
fig = plt.figure(figsize=(15,15), dpi=600)
ax0 = fig.add_subplot(gs0[2:4,0]) # Adding space for raw signals at the top
ax1 = fig.add_subplot(gs0[4,0]) # Adding space for first spectrogram
ax2 = fig.add_subplot(gs0[5,0]) # Adding space for second spectrogram
ax3 = fig.add_subplot(gs0[1,0]) # Adding space for heart rate plotting
ax4 = fig.add_subplot(gs0[0,0]) # Adding space for Acc plotting for breaths
cax = fig.add_subplot(gs0[4:6,1])

#Raw EEG Signals plotted
EEG_names = ['L_EOG', 'L_EMG', 'L_EEG_3', 'R_EEG_4']
EEG_chans = raw[EEG_names, start_sample:stop_sample]
y_offset = np.array([3e-4, 2e-4, 1e-4, 0])  # just enough to separate the channel traces
y = EEG_chans[0].T + y_offset
ax0.plot(EEG_chans[1], EEG_chans[0].T + y_offset, ['#008000','#001000','#003000','#008000'])
y_ax0 = ax0.axes.get_yaxis()
y_ax0.set_visible(False)
ax0.set_ylabel('R EEG   L EEG   L EMG   L EOG')
ax0.set_xlim(start_stop_seconds)
ax0.set_ylim([-0.0001,0.0004])

#Heart Rate Signals plotted
HR = raw['Heart_Rate', start_sample:stop_sample]
ax3.plot(HR[1], HR[0].T)
ax3.set_ylabel('Heart Rate (bpm)')
ax3.set_xlim(start_stop_seconds)

#Accelerometer Signals plotted
Acc_names = ['Accel_X', 'Accel_Y', 'Accel_Z']
Acc = raw[Acc_names, start_sample:stop_sample]
ax4.plot(Acc[1], Acc[0].T)
ax4.set_ylabel('Acceleration (G)')
ax4.set_xlim(start_stop_seconds)

#Plot first spectrogram of LEEG3 (Left Parietal EEG)
spectrum1, freqs1, bins1, im1 = ax1.specgram(LEEG3_selection[0][0], NFFT=NFFT, Fs=Fs, noverlap=900, cmap=cmap, vmin=min_val, vmax=max_val)
ax1.set_ylabel('L EEG (Hz)')
ax1.set_ylim([0, 15])
ax1.set_xlim(start_stop_seconds)
x_ax1 = ax1.axes.get_xaxis()
x_ax1.set_visible(False)

#Plot second spectrogram of REEG4 (Right Parietal EEG)
spectrum2, freqs2, bins2, im2 = ax2.specgram(REEG4_selection[0][0], NFFT=NFFT, Fs=Fs, noverlap=900, cmap=cmap, vmin=min_val, vmax=max_val)
# ax2.set(title='R Parietal EEG')
ax2.set_ylabel('R EEG (Hz)')
ax2.set_ylim([0, 15])
ax2.set_xlabel('Time (seconds)')
ax2.set_xlim(start_stop_seconds)
fig.colorbar(im1, cax=cax)

fig.tight_layout()

#%%

#SOMETHINGS NOT WORKING HERE.. 

# Trying with YASA and same issue:
    
yasa.plot_spectrogram(LEEG3_selection[0][0],Fs)