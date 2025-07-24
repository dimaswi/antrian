<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('counter_id')->constrained()->onDelete('cascade');
            $table->string('queue_number');
            $table->integer('number_sequence');
            $table->enum('status', ['waiting', 'called', 'serving', 'completed', 'cancelled'])->default('waiting');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('called_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->date('queue_date');
            $table->timestamps();

            $table->index(['room_id', 'queue_date']);
            $table->index(['counter_id', 'queue_date']);
            $table->unique(['room_id', 'counter_id', 'number_sequence', 'queue_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
